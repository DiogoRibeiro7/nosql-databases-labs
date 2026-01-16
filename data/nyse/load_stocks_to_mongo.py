#!/usr/bin/env python3
"""
Load the Kaggle-style stocks dataset (JSONL) into MongoDB with exactly 3 collections:

  1) securities               -> securities + embedded fundamentals array
  2) prices                   -> raw daily prices (time-series if supported)
  3) prices_split_adjusted    -> split-adjusted daily prices (time-series if supported)

Input JSONL files (one JSON object per line):
  - securities.jsonl
  - fundamentals.jsonl
  - prices.jsonl
  - prices-split-adjusted.jsonl
"""

from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator, List, Optional

from pymongo import MongoClient, UpdateOne
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import CollectionInvalid, OperationFailure


logger = logging.getLogger("load_stocks_to_mongo")


JsonDict = Dict[str, Any]


def _iter_jsonl(path: Path) -> Iterator[JsonDict]:
    """
    Stream-read a JSONL file.

    Raises:
        FileNotFoundError: if path does not exist
        json.JSONDecodeError: if a line is invalid JSON
    """
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")

    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            s = line.strip()
            if not s:
                continue
            try:
                obj: JsonDict = json.loads(s)
            except json.JSONDecodeError as e:
                raise json.JSONDecodeError(
                    f"{e.msg} (file={path}, line={line_no})", e.doc, e.pos
                ) from e
            yield obj


def _batched(it: Iterable[JsonDict], batch_size: int) -> Iterator[List[JsonDict]]:
    """
    Batch an iterable of dicts into lists of size batch_size.
    """
    if batch_size <= 0:
        raise ValueError("batch_size must be > 0")

    batch: List[JsonDict] = []
    for item in it:
        batch.append(item)
        if len(batch) >= batch_size:
            yield batch
            batch = []
    if batch:
        yield batch


def _drop_if_exists(db: Database, name: str) -> None:
    if name in db.list_collection_names():
        logger.info("Dropping existing collection: %s", name)
        db[name].drop()


def _create_timeseries_or_fallback(
    db: Database,
    name: str,
    *,
    time_field: str,
    meta_field: str,
    granularity: str = "days",
) -> Collection:
    """
    Create a MongoDB time-series collection if supported (MongoDB 5.0+).
    Falls back to a normal collection if not supported or creation fails.
    """
    try:
        db.create_collection(
            name,
            timeseries={
                "timeField": time_field,
                "metaField": meta_field,
                "granularity": granularity,
            },
        )
        logger.info("Created time-series collection: %s", name)
    except CollectionInvalid:
        logger.info("Collection already exists: %s", name)
    except (OperationFailure, TypeError) as e:
        # TypeError can happen if pymongo/server doesn't accept timeseries option.
        logger.warning(
            "Could not create time-series collection %s. Falling back. Reason: %s",
            name,
            e,
        )
        # Ensure it exists as normal collection
        if name not in db.list_collection_names():
            db.create_collection(name)

    return db[name]


def _insert_jsonl(
    coll: Collection,
    path: Path,
    *,
    batch_size: int,
    ordered: bool = False,
) -> None:
    """
    Insert JSONL into a collection in batches.
    """
    total = 0
    for batch in _batched(_iter_jsonl(path), batch_size=batch_size):
        if batch:
            coll.insert_many(batch, ordered=ordered)
            total += len(batch)
    logger.info("Inserted %d docs into %s from %s", total, coll.name, path.name)


def _ensure_price_indexes(coll: Collection) -> None:
    # Useful even for time-series collections.
    coll.create_index([("symbol", 1), ("date", 1)])


def _convert_prices_dates(db: Database) -> None:
    """
    Convert string dates in prices collections to BSON Date.
    Handles:
      - prices.date = "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
      - prices_split_adjusted.date = "YYYY-MM-DD"
    """
    # prices: try datetime format first, then date-only
    db["prices"].update_many(
        {"date": {"$type": "string"}},
        [
            {
                "$set": {
                    "date": {
                        "$ifNull": [
                            {
                                "$dateFromString": {
                                    "dateString": "$date",
                                    "format": "%Y-%m-%d %H:%M:%S",
                                    "onError": None,
                                }
                            },
                            {
                                "$dateFromString": {
                                    "dateString": "$date",
                                    "format": "%Y-%m-%d",
                                    "onError": None,
                                }
                            },
                        ]
                    }
                }
            }
        ],
    )

    # prices_split_adjusted: date-only
    db["prices_split_adjusted"].update_many(
        {"date": {"$type": "string"}},
        [
            {
                "$set": {
                    "date": {
                        "$dateFromString": {
                            "dateString": "$date",
                            "format": "%Y-%m-%d",
                            "onError": None,
                        }
                    }
                }
            }
        ],
    )


def _build_securities_from_raw(db: Database) -> None:
    """
    Transform securities_raw -> securities:
      _id = "Ticker symbol"
      rename a few fields into snake_case
    Uses $getField to safely read keys with spaces.
    """
    pipeline: List[JsonDict] = [
        {
            "$project": {
                "_id": {"$getField": {"field": "Ticker symbol", "input": "$$ROOT"}},
                "ticker": {"$getField": {"field": "Ticker symbol", "input": "$$ROOT"}},
                "name": {"$getField": {"field": "Security", "input": "$$ROOT"}},
                "sec_filings": {"$getField": {"field": "SEC filings", "input": "$$ROOT"}},
                "gics_sector": {"$getField": {"field": "GICS Sector", "input": "$$ROOT"}},
                "gics_sub_industry": {
                    "$getField": {"field": "GICS Sub Industry", "input": "$$ROOT"}
                },
                "hq_address": {
                    "$getField": {"field": "Address of Headquarters", "input": "$$ROOT"}
                },
                "date_first_added": {
                    "$let": {
                        "vars": {
                            "v": {"$getField": {"field": "Date first added", "input": "$$ROOT"}}
                        },
                        "in": {
                            "$cond": [
                                {"$or": [{"$eq": ["$$v", None]}, {"$eq": ["$$v", ""]}]},
                                None,
                                {"$dateFromString": {"dateString": "$$v", "onError": None}},
                            ]
                        },
                    }
                },
                "cik": {
                    "$convert": {
                        "input": {"$getField": {"field": "CIK", "input": "$$ROOT"}},
                        "to": "int",
                        "onError": None,
                        "onNull": None,
                    }
                },
            }
        },
        {
            "$merge": {
                "into": "securities",
                "on": "_id",
                "whenMatched": "replace",
                "whenNotMatched": "insert",
            }
        },
    ]

    list(db["securities_raw"].aggregate(pipeline, allowDiskUse=True))


def _embed_fundamentals_into_securities(db: Database) -> None:
    """
    Group fundamentals by ticker and embed into securities.fundamentals.
    Your fundamentals keys:
      - "Ticker Symbol"
      - "Period Ending" as "YYYY-MM-DD"
      - lots of metric columns (kept as-is)
    """
    pipeline: List[JsonDict] = [
        {
            "$set": {
                "symbol": {"$getField": {"field": "Ticker Symbol", "input": "$$ROOT"}},
                "period_ending": {
                    "$dateFromString": {
                        "dateString": {"$getField": {"field": "Period Ending", "input": "$$ROOT"}},
                        "format": "%Y-%m-%d",
                        "onError": None,
                    }
                },
            }
        },
        {"$unset": ["Unnamed: 0", "Ticker Symbol", "Period Ending"]},
        {"$sort": {"symbol": 1, "period_ending": 1}},
        {"$group": {"_id": "$symbol", "fundamentals": {"$push": "$$ROOT"}}},
        {
            "$merge": {
                "into": "securities",
                "on": "_id",
                "whenMatched": [{"$set": {"fundamentals": "$fundamentals"}}],
                "whenNotMatched": "discard",
            }
        },
    ]

    list(db["fundamentals_stage"].aggregate(pipeline, allowDiskUse=True))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mongo-uri", type=str, required=True)
    parser.add_argument("--db", type=str, default="stocks")
    parser.add_argument("--input-dir", type=str, required=True)
    parser.add_argument("--batch-size", type=int, default=5000)
    parser.add_argument("--drop", action="store_true", help="Drop target collections if they exist.")
    args = parser.parse_args()

    mongo_uri: str = args.mongo_uri
    db_name: str = args.db
    input_dir = Path(args.input_dir)
    batch_size: int = args.batch_size
    drop: bool = bool(args.drop)

    if batch_size <= 0:
        raise ValueError("--batch-size must be > 0")

    securities_path = input_dir / "securities.jsonl"
    fundamentals_path = input_dir / "fundamentals.jsonl"
    prices_path = input_dir / "prices.jsonl"
    prices_adj_path = input_dir / "prices-split-adjusted.jsonl"

    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")

    client = MongoClient(mongo_uri)
    db = client[db_name]

    if drop:
        for name in [
            "securities",
            "prices",
            "prices_split_adjusted",
            "securities_raw",
            "fundamentals_stage",
        ]:
            _drop_if_exists(db, name)

    # Staging collections
    if "securities_raw" not in db.list_collection_names():
        db.create_collection("securities_raw")
    if "fundamentals_stage" not in db.list_collection_names():
        db.create_collection("fundamentals_stage")

    # Final collections
    _create_timeseries_or_fallback(db, "prices", time_field="date", meta_field="symbol")
    _create_timeseries_or_fallback(
        db, "prices_split_adjusted", time_field="date", meta_field="symbol"
    )
    if "securities" not in db.list_collection_names():
        db.create_collection("securities")

    # Load files
    _insert_jsonl(db["securities_raw"], securities_path, batch_size=batch_size)
    _insert_jsonl(db["fundamentals_stage"], fundamentals_path, batch_size=batch_size)

    _insert_jsonl(db["prices"], prices_path, batch_size=batch_size)
    _insert_jsonl(db["prices_split_adjusted"], prices_adj_path, batch_size=batch_size)

    # Normalize price dates and index
    _convert_prices_dates(db)
    _ensure_price_indexes(db["prices"])
    _ensure_price_indexes(db["prices_split_adjusted"])

    # Build securities and embed fundamentals
    _build_securities_from_raw(db)
    _embed_fundamentals_into_securities(db)

    # Cleanup staging
    db["securities_raw"].drop()
    db["fundamentals_stage"].drop()

    logger.info("Done. Collections: securities, prices, prices_split_adjusted")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
