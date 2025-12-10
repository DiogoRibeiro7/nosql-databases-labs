from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple


@dataclass
class TableSchema:
    """
    Representation of a table schema.

    Attributes:
        name: Name of the table.
        columns: Ordered list of column names.
    """
    name: str
    columns: List[str]


def read_text(path: Path) -> str:
    """
    Read a text file as UTF-8.

    Args:
        path: Path to the file.

    Returns:
        File contents as a single string.
    """
    return path.read_text(encoding="utf-8")


def build_sakila_schemas() -> Dict[str, TableSchema]:
    """
    Build hard-coded schemas for the standard Sakila tables.

    This avoids the complexity of parsing the schema SQL with regexes,
    which can be brittle across different Sakila versions.

    Returns:
        Mapping from table name to TableSchema.
    """
    specs: Dict[str, List[str]] = {
        "actor": [
            "actor_id",
            "first_name",
            "last_name",
            "last_update",
        ],
        "address": [
            "address_id",
            "address",
            "address2",
            "district",
            "city_id",
            "postal_code",
            "phone",
            "location",
            "last_update",
        ],
        "category": [
            "category_id",
            "name",
            "last_update",
        ],
        "city": [
            "city_id",
            "city",
            "country_id",
            "last_update",
        ],
        "country": [
            "country_id",
            "country",
            "last_update",
        ],
        "customer": [
            "customer_id",
            "store_id",
            "first_name",
            "last_name",
            "email",
            "address_id",
            "active",
            "create_date",
            "last_update",
        ],
        "film": [
            "film_id",
            "title",
            "description",
            "release_year",
            "language_id",
            "original_language_id",
            "rental_duration",
            "rental_rate",
            "length",
            "replacement_cost",
            "rating",
            "special_features",
            "last_update",
        ],
        "film_actor": [
            "actor_id",
            "film_id",
            "last_update",
        ],
        "film_category": [
            "film_id",
            "category_id",
            "last_update",
        ],
        "film_text": [
            "film_id",
            "title",
            "description",
        ],
        "inventory": [
            "inventory_id",
            "film_id",
            "store_id",
            "last_update",
        ],
        "language": [
            "language_id",
            "name",
            "last_update",
        ],
        "payment": [
            "payment_id",
            "customer_id",
            "staff_id",
            "rental_id",
            "amount",
            "payment_date",
            "last_update",
        ],
        "rental": [
            "rental_id",
            "rental_date",
            "inventory_id",
            "customer_id",
            "return_date",
            "staff_id",
            "last_update",
        ],
        "staff": [
            "staff_id",
            "first_name",
            "last_name",
            "address_id",
            "picture",
            "email",
            "store_id",
            "active",
            "username",
            "password",
            "last_update",
        ],
        "store": [
            "store_id",
            "manager_staff_id",
            "address_id",
            "last_update",
        ],
    }

    return {name: TableSchema(name=name, columns=cols) for name, cols in specs.items()}


def split_value_groups(values_sql: str) -> List[str]:
    """
    Split the VALUES part of an INSERT into individual "(...)" groups.

    This scans character by character to respect quotes and escapes.

    Args:
        values_sql: String after the VALUES keyword, e.g. "(...),(...),(...)".

    Returns:
        List of strings, each including the surrounding parentheses "( ... )".
    """
    values_sql = values_sql.strip()
    # Remove trailing semicolon if present
    if values_sql.endswith(";"):
        values_sql = values_sql[:-1]

    groups: List[str] = []
    current: List[str] = []
    depth = 0
    in_string = False
    escape = False

    for ch in values_sql:
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

        if not in_string:
            if ch == "(":
                depth += 1
                current.append(ch)
                continue
            if ch == ")":
                depth -= 1
                current.append(ch)
                if depth == 0:
                    # End of one group
                    groups.append("".join(current).strip())
                    current = []
                continue
            if ch == "," and depth == 0:
                # Comma between groups: just ignore it
                continue

            # Any other character outside strings
            current.append(ch)
        else:
            # Inside string, keep everything as-is (except handled above)
            current.append(ch)

    # Just in case there is leftover content (should not happen in well-formed dumps)
    if current:
        leftover = "".join(current).strip()
        if leftover:
            groups.append(leftover)

    return groups


def split_values_inside_group(group: str) -> List[str]:
    """
    Split a single "(...)" group into individual value strings.

    Args:
        group: A string like "(1,'PENELOPE','GUINESS','2006-02-15 04:34:33')".

    Returns:
        List of raw value tokens as strings (without further conversion).
    """
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
            # Separator between values
            values.append("".join(current).strip())
            current = []
        else:
            current.append(ch)

    # Last value
    if current:
        values.append("".join(current).strip())

    return values


def sql_token_to_python(token: str) -> Any:
    """
    Convert a single SQL literal token to a Python value.

    Handles:
    - NULL -> None
    - quoted strings -> str (with unescaping)
    - unquoted numeric tokens -> int/float if possible, else original string.

    Args:
        token: Raw token as extracted from the VALUES list.

    Returns:
        Python value.
    """
    if token.upper() == "NULL":
        return None

    # String literal
    if token.startswith("'") and token.endswith("'"):
        inner = token[1:-1]
        # Unescape common MySQL escape sequences
        # For Sakila, main concern is '\'' and '\\'
        inner = inner.replace("\\'", "'").replace("\\\\", "\\")
        return inner

    # Try int
    try:
        return int(token)
    except ValueError:
        pass

    # Try float
    try:
        return float(token)
    except ValueError:
        pass

    # Fallback to raw string
    return token


def parse_insert_statement(
    stmt: str,
    schemas: Dict[str, TableSchema],
) -> Optional[Tuple[str, List[Dict[str, Any]]]]:
    """
    Parse a single INSERT statement into a list of row dicts.

    Args:
        stmt: Full INSERT statement, possibly spanning multiple lines.
        schemas: Mapping of table names to TableSchema, to know the column order.

    Returns:
        (table_name, list_of_rows) if the statement is an INSERT for a known table;
        None otherwise.
    """
    stmt = stmt.strip()
    if not stmt.upper().startswith("INSERT INTO"):
        return None

    # Typical MySQL format:
    # INSERT INTO `table_name` VALUES (...),(...),(...);
    # or: INSERT INTO `table_name` (`col1`,`col2`,...) VALUES (...),(...);
    insert_pattern = re.compile(
        r"INSERT\s+INTO\s+`?(?P<table>[^\s`(]+)`?\s*(?:\((?P<cols>[^)]*)\))?\s*VALUES\s*(?P<values>.+);",
        re.IGNORECASE | re.DOTALL,
    )
    m = insert_pattern.match(stmt)
    if not m:
        return None

    table_name = m.group("table")
    cols_spec = m.group("cols")
    values_sql = m.group("values")

    # Determine column order
    if cols_spec:
        # Columns are explicitly listed in the INSERT
        col_names = [c.strip(" `") for c in cols_spec.split(",")]
    else:
        # Use hard-coded table schema
        schema = schemas.get(table_name)
        if schema is None:
            # Unknown table: skip it silently
            print(f"Warning: no schema for table '{table_name}', skipping its INSERT.")
            return None
        col_names = schema.columns

    groups = split_value_groups(values_sql)
    rows: List[Dict[str, Any]] = []

    for group in groups:
        tokens = split_values_inside_group(group)
        if len(tokens) != len(col_names):
            raise ValueError(
                f"Column count mismatch in table '{table_name}': "
                f"{len(col_names)} columns but {len(tokens)} values.\n"
                f"Group: {group}"
            )

        row: Dict[str, Any] = {}
        for col, tok in zip(col_names, tokens):
            row[col] = sql_token_to_python(tok)
        rows.append(row)

    return table_name, rows


def parse_data_file(
    data_sql: str,
    schemas: Dict[str, TableSchema],
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Parse the entire sakila-data.sql into per-table row dictionaries.

    Args:
        data_sql: Contents of sakila-data.sql.
        schemas: Mapping from table names to TableSchema.

    Returns:
        Mapping from table name to list of row dictionaries.
    """
    tables_to_rows: Dict[str, List[Dict[str, Any]]] = {}

    # We need to re-assemble statements, because INSERTs may span multiple lines.
    buffer: List[str] = []
    for line in data_sql.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        buffer.append(stripped)
        if stripped.endswith(";"):
            # End of one statement
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
    Write a table to CSV with header.

    Args:
        table_name: Name of the table.
        columns: Ordered list of column names.
        rows: List of row dictionaries.
        out_dir: Output directory.
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
    Write a table to JSON as a list of objects.

    Args:
        table_name: Name of the table.
        rows: List of row dictionaries.
        out_dir: Output directory.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{table_name}.json"

    with path.open("w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2, default=str)


def main() -> None:
    """
    Top-level orchestration:

    1. Read sakila-data.sql.
    2. Use hard-coded Sakila schemas.
    3. Parse INSERT statements into per-table rows.
    4. Export each table to CSV and JSON.
    """
    base_dir = Path(".")
    data_path = base_dir / "sakila-data.sql"
    out_dir = base_dir / "output"

    if not data_path.exists():
        raise FileNotFoundError(f"Data file not found: {data_path}")

    data_sql = read_text(data_path)
    schemas = build_sakila_schemas()
    print("Known tables:", ", ".join(sorted(schemas.keys())))

    tables_to_rows = parse_data_file(data_sql, schemas)

    for table_name, rows in tables_to_rows.items():
        schema = schemas.get(table_name)
        if schema is None:
            print(f"Warning: parsed rows for unknown table '{table_name}', skipping export.")
            continue

        print(f"Exporting table '{table_name}' with {len(rows)} rows...")
        write_csv(table_name, schema.columns, rows, out_dir)
        write_json(table_name, rows, out_dir)

    print("Done. Files written to:", out_dir.resolve())


if __name__ == "__main__":
    main()
