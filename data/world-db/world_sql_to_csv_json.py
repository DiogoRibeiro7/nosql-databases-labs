from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class TableSchema:
    """
    Representation of a table schema.

    Attributes:
        name: Canonical name of the table.
        columns: Ordered list of column names in that table.
    """
    name: str
    columns: List[str]


def read_text(path: Path) -> str:
    """
    Read a text file as UTF-8 text.

    Args:
        path: Path to the file to read.

    Returns:
        File contents as a single string.
    """
    return path.read_text(encoding="utf-8")


def build_world_schemas() -> Dict[str, TableSchema]:
    """
    Build hard-coded schemas for the standard MySQL World sample database.

    Tables:
        - city
        - country
        - countrylanguage

    Returns:
        Mapping from lower-cased table name to TableSchema.
    """
    specs: Dict[str, List[str]] = {
        "city": [
            "ID",
            "Name",
            "CountryCode",
            "District",
            "Population",
        ],
        "country": [
            "Code",
            "Name",
            "Continent",
            "Region",
            "SurfaceArea",
            "IndepYear",
            "Population",
            "LifeExpectancy",
            "GNP",
            "GNPOld",
            "LocalName",
            "GovernmentForm",
            "HeadOfState",
            "Capital",
            "Code2",
        ],
        "countrylanguage": [
            "CountryCode",
            "Language",
            "IsOfficial",
            "Percentage",
        ],
    }

    # Keyed by lower-case table name for case-insensitive matching.
    return {name.lower(): TableSchema(name=name, columns=cols) for name, cols in specs.items()}


def split_value_groups(values_sql: str) -> List[str]:
    """
    Split the VALUES part of an INSERT into individual "(...)" groups.

    This function scans the string character by character, tracking:
      - Parenthesis nesting depth to find each "(...)"
      - String literals and escapes so commas inside strings are not treated
        as group separators.

    Args:
        values_sql: String after the VALUES keyword, e.g. "(...),(...),(...)".

    Returns:
        List of strings, each including the surrounding parentheses "( ... )".
    """
    values_sql = values_sql.strip()
    if values_sql.endswith(";"):
        values_sql = values_sql[:-1]

    groups: List[str] = []
    current: List[str] = []
    depth = 0
    in_string = False
    escape = False

    for ch in values_sql:
        if escape:
            # Previous character was a backslash, so this character is escaped.
            current.append(ch)
            escape = False
            continue

        if ch == "\\":
            current.append(ch)
            escape = True
            continue

        if ch == "'":
            # Toggle string literal state.
            in_string = not in_string
            current.append(ch)
            continue

        if not in_string:
            if ch == "(":
                depth += 1
                current.append(ch)
                continue

            if ch == ")":
                depth -= 1
                current.append(ch)
                if depth == 0:
                    # Completed one "(...)" group.
                    groups.append("".join(current).strip())
                    current = []
                continue

            if ch == "," and depth == 0:
                # Comma between groups: ignore.
                continue

            # Any other character outside of strings.
            current.append(ch)
        else:
            # Inside string literal: keep as-is.
            current.append(ch)

    # If there is leftover content, treat it as a final group (defensive).
    if current:
        leftover = "".join(current).strip()
        if leftover:
            groups.append(leftover)

    return groups


def split_values_inside_group(group: str) -> List[str]:
    """
    Split a single "(...)" tuple group into individual value tokens.

    Args:
        group: A string like "(1,'Kabul','AFG','Kabol',1780000)".

    Returns:
        List of raw token strings, one per column.
    """
    group = group.strip()
    if not (group.startswith("(") and group.endswith(")")):
        raise ValueError(f"Group must start with '(' and end with ')': {group!r}")

    inner = group[1:-1]  # strip outer parentheses

    values: List[str] = []
    current: List[str] = []
    in_string = False
    escape = False

    for ch in inner:
        if escape:
            current.append(ch)
            escape = False
            continue

        if ch == "\\":
            current.append(ch)
            escape = True
            continue

        if ch == "'":
            in_string = not in_string
            current.append(ch)
            continue

        if ch == "," and not in_string:
            # Separator between values.
            values.append("".join(current).strip())
            current = []
        else:
            current.append(ch)

    if current:
        values.append("".join(current).strip())

    return values


def sql_token_to_python(token: str) -> Any:
    """
    Convert a single SQL literal token to a Python value.

    Conversion rules:
        - "NULL" (case-insensitive) -> None
        - quoted string -> Python str (with simple unescaping)
        - unquoted token -> try int, then float, else raw string

    Args:
        token: Raw token string.

    Returns:
        Python representation of the value.
    """
    upper = token.upper()
    if upper == "NULL":
        return None

    # String literal
    if token.startswith("'") and token.endswith("'"):
        inner = token[1:-1]
        # Very simple unescaping suitable for World sample dump.
        inner = inner.replace("\\'", "'").replace("\\\\", "\\")
        return inner

    # Try integer
    try:
        return int(token)
    except ValueError:
        pass

    # Try float
    try:
        return float(token)
    except ValueError:
        pass

    # Fallback: raw string
    return token


def parse_insert_statement(
    stmt: str,
    schemas: Dict[str, TableSchema],
) -> Optional[Tuple[str, List[Dict[str, Any]]]]:
    """
    Parse a single INSERT statement into a list of row dictionaries.

    The function supports:
        INSERT INTO `table` VALUES (...),(...),...;
        INSERT INTO table VALUES (...),(...),...;
        INSERT INTO table(col1,col2,...) VALUES (...),(...),...;

    Args:
        stmt: Full SQL statement text.
        schemas: Mapping from lower-case table name to TableSchema.

    Returns:
        (canonical_table_name, list_of_rows) if the statement is a recognized
        INSERT; None otherwise.
    """
    stmt = stmt.strip()
    if not stmt.upper().startswith("INSERT INTO"):
        return None

    insert_pattern = re.compile(
        r"INSERT\s+INTO\s+`?(?P<table>[^\s`(]+)`?\s*"
        r"(?:\((?P<cols>[^)]*)\))?\s*VALUES\s*(?P<values>.+);",
        re.IGNORECASE | re.DOTALL,
    )

    match = insert_pattern.match(stmt)
    if not match:
        # Not a well-formed INSERT we care about.
        return None

    raw_table = match.group("table")
    table_key = raw_table.lower()
    cols_spec = match.group("cols")
    values_sql = match.group("values")

    # Determine column order.
    if cols_spec:
        # Columns are explicitly listed in the INSERT.
        col_names = [c.strip(" `") for c in cols_spec.split(",")]
    else:
        schema = schemas.get(table_key)
        if schema is None:
            # Unknown table: ignore this INSERT.
            print(f"Warning: no schema for table '{raw_table}', skipping its INSERT.")
            return None
        col_names = schema.columns

    groups = split_value_groups(values_sql)
    rows: List[Dict[str, Any]] = []

    for group in groups:
        tokens = split_values_inside_group(group)
        if len(tokens) != len(col_names):
            raise ValueError(
                f"Column count mismatch in table '{raw_table}': "
                f"{len(col_names)} columns but {len(tokens)} values.\n"
                f"Group: {group}"
            )

        row: Dict[str, Any] = {}
        for col, tok in zip(col_names, tokens):
            row[col] = sql_token_to_python(tok)
        rows.append(row)

    # Use canonical table name from schema if available, otherwise fall back
    # to the raw table name from the INSERT statement.
    canonical_table_name = schemas.get(table_key, TableSchema(raw_table, col_names)).name

    return canonical_table_name, rows


def parse_data_file(
    data_sql: str,
    schemas: Dict[str, TableSchema],
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Parse the entire world.sql file into per-table row dictionaries.

    This function:
      - Re-assembles multi-line SQL statements.
      - Passes each completed statement into parse_insert_statement().
      - Aggregates rows per table.

    Args:
        data_sql: The full text content of world.sql.
        schemas: Mapping from lower-case table name to TableSchema.

    Returns:
        Mapping from canonical table name to list of row dictionaries.
    """
    tables_to_rows: Dict[str, List[Dict[str, Any]]] = {}
    buffer: List[str] = []

    for line in data_sql.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        buffer.append(stripped)
        if stripped.endswith(";"):
            # End of one statement.
            stmt = " ".join(buffer)
            buffer = []

            parsed = parse_insert_statement(stmt, schemas)
            if parsed is None:
                continue

            table_name, rows = parsed
            tables_to_rows.setdefault(table_name, []).extend(rows)

    return tables_to_rows


def write_csv(
    table_name: str,
    columns: List[str],
    rows: List[Dict[str, Any]],
    out_dir: Path,
) -> None:
    """
    Write a table's rows to a CSV file with header.

    Args:
        table_name: Logical name of the table.
        columns: Ordered list of column names.
        rows: List of row dictionaries.
        out_dir: Directory where the CSV file will be written.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{table_name}.csv"

    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def write_json(
    table_name: str,
    rows: List[Dict[str, Any]],
    out_dir: Path,
) -> None:
    """
    Write a table's rows to a JSON file as a list of objects.

    Args:
        table_name: Logical name of the table.
        rows: List of row dictionaries.
        out_dir: Directory where the JSON file will be written.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{table_name}.json"

    with path.open("w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2, default=str)


def main() -> None:
    """
    Orchestrate conversion of world.sql into CSV and JSON files.

    Steps:
        1. Read world.sql from the current directory.
        2. Build hard-coded World table schemas.
        3. Parse INSERT statements into per-table rows.
        4. Export each table to CSV and JSON under 'output_world/'.
    """
    base_dir = Path(".")
    data_path = base_dir / "world.sql"
    out_dir = base_dir / "output_world"

    if not data_path.exists():
        raise FileNotFoundError(f"Data file not found: {data_path}")

    data_sql = read_text(data_path)
    schemas = build_world_schemas()

    print("Known World tables:", ", ".join(sorted(schemas.keys())))

    tables_to_rows = parse_data_file(data_sql, schemas)

    for table_name, rows in tables_to_rows.items():
        schema = schemas.get(table_name.lower())
        if schema is None:
            print(f"Warning: parsed rows for unknown table '{table_name}', skipping export.")
            continue

        print(f"Exporting table '{table_name}' with {len(rows)} rows...")
        write_csv(table_name, schema.columns, rows, out_dir)
        write_json(table_name, rows, out_dir)

    print("Done. Files written to:", out_dir.resolve())


if __name__ == "__main__":
    main()
