"""
Sakila JSON to MongoDB Transformation
======================================
Transforms Sakila JSON table exports into a moderately denormalized
MongoDB schema with 4 collections: films, customers, stores, rentals.

Author: Diogo Ribeiro
Institution: ESMAD - Instituto Politécnico do Porto

Requirements:
    pip install pymongo python-dotenv

Usage:
    python sakila_json_to_mongodb.py --input ./sakila_json --output mongodb://localhost:27017

Schema Design:
    - films: embedded actors[], categories[], spoken_language
    - customers: embedded address.city.country
    - stores: embedded address, manager
    - rentals: embedded payments[], references (customer_id, film_id, staff_id, store_id)
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Any
from pymongo import MongoClient, InsertOne
from pymongo.database import Database


# =============================================================================
# JSON Loader
# =============================================================================

class SakilaJsonLoader:
    """Loads Sakila JSON files into indexed dictionaries."""

    def __init__(self, input_dir: Path):
        self.input_dir = input_dir
        self._cache: dict[str, list[dict]] = {}

    def _load_file(self, name: str) -> list[dict]:
        """Load a JSON file by table name."""
        if name not in self._cache:
            filepath = self.input_dir / f"{name}.json"
            if not filepath.exists():
                print(f"    Warning: {filepath} not found")
                return []
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Handle both array and object with data key
                if isinstance(data, dict) and "data" in data:
                    data = data["data"]
                self._cache[name] = data
                print(f"    Loaded {name}.json ({len(data)} records)")
        return self._cache[name]

    def _index_by(self, name: str, key: str) -> dict[int, dict]:
        """Load and index by a specific key."""
        return {row[key]: row for row in self._load_file(name)}

    def _group_by(self, name: str, key: str) -> dict[int, list[dict]]:
        """Load and group by a specific key."""
        result: dict[int, list[dict]] = {}
        for row in self._load_file(name):
            result.setdefault(row[key], []).append(row)
        return result

    # Indexed tables (by primary key)
    @property
    def countries(self) -> dict[int, dict]:
        return self._index_by("country", "country_id")

    @property
    def cities(self) -> dict[int, dict]:
        return self._index_by("city", "city_id")

    @property
    def addresses(self) -> dict[int, dict]:
        return self._index_by("address", "address_id")

    @property
    def languages(self) -> dict[int, dict]:
        return self._index_by("language", "language_id")

    @property
    def actors(self) -> dict[int, dict]:
        return self._index_by("actor", "actor_id")

    @property
    def categories(self) -> dict[int, dict]:
        return self._index_by("category", "category_id")

    @property
    def films(self) -> dict[int, dict]:
        return self._index_by("film", "film_id")

    @property
    def customers(self) -> dict[int, dict]:
        return self._index_by("customer", "customer_id")

    @property
    def staff(self) -> dict[int, dict]:
        return self._index_by("staff", "staff_id")

    @property
    def stores(self) -> dict[int, dict]:
        return self._index_by("store", "store_id")

    @property
    def inventory(self) -> dict[int, dict]:
        return self._index_by("inventory", "inventory_id")

    @property
    def rentals(self) -> list[dict]:
        return self._load_file("rental")

    # Junction tables (grouped)
    @property
    def film_actors(self) -> dict[int, list[int]]:
        """Returns {film_id: [actor_id, ...]}"""
        result: dict[int, list[int]] = {}
        for row in self._load_file("film_actor"):
            result.setdefault(row["film_id"], []).append(row["actor_id"])
        return result

    @property
    def film_categories(self) -> dict[int, list[int]]:
        """Returns {film_id: [category_id, ...]}"""
        result: dict[int, list[int]] = {}
        for row in self._load_file("film_category"):
            result.setdefault(row["film_id"], []).append(row["category_id"])
        return result

    @property
    def payments_by_rental(self) -> dict[int, list[dict]]:
        """Returns {rental_id: [payment, ...]}"""
        return self._group_by("payment", "rental_id")


# =============================================================================
# Document Builders
# =============================================================================

def parse_datetime(value: Any) -> datetime | None:
    """Parse datetime from string or return as-is."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        # Handle common formats
        for fmt in ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"]:
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
    return value


class FilmsBuilder:
    """Builds the films collection with embedded actors and categories."""

    def __init__(self, loader: SakilaJsonLoader):
        self.loader = loader

    def build_all(self) -> list[dict]:
        documents = []
        film_actors = self.loader.film_actors
        film_categories = self.loader.film_categories

        for film_id, film in self.loader.films.items():
            # Embedded language
            lang = self.loader.languages.get(film.get("language_id", 0), {})
            orig_lang_id = film.get("original_language_id")
            orig_lang = self.loader.languages.get(orig_lang_id) if orig_lang_id else None

            # Embedded actors
            actor_ids = film_actors.get(film_id, [])
            actors = [
                {
                    "actor_id": self.loader.actors[aid]["actor_id"],
                    "first_name": self.loader.actors[aid]["first_name"],
                    "last_name": self.loader.actors[aid]["last_name"],
                }
                for aid in actor_ids if aid in self.loader.actors
            ]

            # Embedded categories
            category_ids = film_categories.get(film_id, [])
            categories = [
                {
                    "category_id": self.loader.categories[cid]["category_id"],
                    "name": self.loader.categories[cid]["name"],
                }
                for cid in category_ids if cid in self.loader.categories
            ]

            # Parse special_features
            special_features = film.get("special_features")
            if isinstance(special_features, str):
                special_features = [sf.strip() for sf in special_features.split(",")]

            doc = {
                "film_id": film["film_id"],
                "title": film.get("title"),
                "description": film.get("description"),
                "release_year": film.get("release_year"),
                "rental_duration": film.get("rental_duration"),
                "rental_rate": float(film.get("rental_rate", 0)),
                "length": film.get("length"),
                "replacement_cost": float(film.get("replacement_cost", 0)),
                "rating": film.get("rating"),
                "special_features": special_features,
                "spoken_language": {
                    "language_id": lang.get("language_id"),
                    "name": lang.get("name"),
                },
                "original_language": {
                    "language_id": orig_lang["language_id"],
                    "name": orig_lang["name"],
                } if orig_lang else None,
                "actors": actors,
                "categories": categories,
            }
            documents.append(doc)

        return documents


class CustomersBuilder:
    """Builds the customers collection with embedded address chain."""

    def __init__(self, loader: SakilaJsonLoader):
        self.loader = loader

    def _build_address(self, address_id: int) -> dict | None:
        addr = self.loader.addresses.get(address_id)
        if not addr:
            return None

        city = self.loader.cities.get(addr.get("city_id", 0), {})
        country = self.loader.countries.get(city.get("country_id", 0), {})

        return {
            "address_id": addr.get("address_id"),
            "address": addr.get("address"),
            "address2": addr.get("address2"),
            "district": addr.get("district"),
            "postal_code": addr.get("postal_code"),
            "phone": addr.get("phone"),
            "city": {
                "city_id": city.get("city_id"),
                "city": city.get("city"),
            },
            "country": {
                "country_id": country.get("country_id"),
                "country": country.get("country"),
            },
        }

    def build_all(self) -> list[dict]:
        documents = []

        for cust_id, cust in self.loader.customers.items():
            doc = {
                "customer_id": cust["customer_id"],
                "store_id": cust.get("store_id"),
                "first_name": cust.get("first_name"),
                "last_name": cust.get("last_name"),
                "email": cust.get("email"),
                "active": bool(cust.get("active", 1)),
                "create_date": parse_datetime(cust.get("create_date")),
                "address": self._build_address(cust.get("address_id", 0)),
            }
            documents.append(doc)

        return documents


class StoresBuilder:
    """Builds the stores collection with embedded address and manager."""

    def __init__(self, loader: SakilaJsonLoader):
        self.loader = loader

    def _build_address(self, address_id: int) -> dict | None:
        addr = self.loader.addresses.get(address_id)
        if not addr:
            return None

        city = self.loader.cities.get(addr.get("city_id", 0), {})
        country = self.loader.countries.get(city.get("country_id", 0), {})

        return {
            "address_id": addr.get("address_id"),
            "address": addr.get("address"),
            "address2": addr.get("address2"),
            "district": addr.get("district"),
            "postal_code": addr.get("postal_code"),
            "phone": addr.get("phone"),
            "city": {
                "city_id": city.get("city_id"),
                "city": city.get("city"),
            },
            "country": {
                "country_id": country.get("country_id"),
                "country": country.get("country"),
            },
        }

    def _build_manager(self, staff_id: int) -> dict | None:
        staff = self.loader.staff.get(staff_id)
        if not staff:
            return None

        return {
            "staff_id": staff["staff_id"],
            "first_name": staff.get("first_name"),
            "last_name": staff.get("last_name"),
            "email": staff.get("email"),
            "username": staff.get("username"),
            "active": bool(staff.get("active", 1)),
            "address": self._build_address(staff.get("address_id", 0)),
        }

    def build_all(self) -> list[dict]:
        documents = []

        for store_id, store in self.loader.stores.items():
            doc = {
                "store_id": store["store_id"],
                "address": self._build_address(store.get("address_id", 0)),
                "manager": self._build_manager(store.get("manager_staff_id", 0)),
            }
            documents.append(doc)

        return documents


class RentalsBuilder:
    """Builds the rentals collection with embedded payments and references."""

    def __init__(self, loader: SakilaJsonLoader):
        self.loader = loader

    def build_all(self) -> list[dict]:
        documents = []
        payments_by_rental = self.loader.payments_by_rental

        for rental in self.loader.rentals:
            rental_id = rental["rental_id"]
            inventory_id = rental.get("inventory_id", 0)
            inventory = self.loader.inventory.get(inventory_id, {})

            # Embedded payments
            payments = [
                {
                    "payment_id": p["payment_id"],
                    "amount": float(p.get("amount", 0)),
                    "payment_date": parse_datetime(p.get("payment_date")),
                }
                for p in payments_by_rental.get(rental_id, [])
            ]

            doc = {
                "rental_id": rental_id,
                "rental_date": parse_datetime(rental.get("rental_date")),
                "return_date": parse_datetime(rental.get("return_date")),
                # References (not embedded)
                "customer_id": rental.get("customer_id"),
                "film_id": inventory.get("film_id"),
                "inventory_id": inventory_id,
                "staff_id": rental.get("staff_id"),
                "store_id": inventory.get("store_id"),
                # Embedded payments
                "payments": payments,
            }
            documents.append(doc)

        return documents


# =============================================================================
# MongoDB Writer
# =============================================================================

class MongoWriter:
    """Writes documents to MongoDB collections."""

    def __init__(self, uri: str, database: str):
        self.client = MongoClient(uri)
        self.db: Database = self.client[database]

    def write_collection(
        self,
        name: str,
        documents: list[dict],
        indexes: list[tuple[str, int] | tuple[str, str]],
    ) -> int:
        """Drop, create indexes, and insert documents."""
        collection = self.db[name]
        collection.drop()

        # Create indexes
        for idx in indexes:
            if idx[1] == "text":
                collection.create_index([(idx[0], "text")])
            else:
                collection.create_index([idx])

        # Bulk insert
        if documents:
            result = collection.insert_many(documents)
            return len(result.inserted_ids)
        return 0

    def close(self):
        self.client.close()


# =============================================================================
# Main ETL
# =============================================================================

def run_etl(input_dir: Path, mongo_uri: str, mongo_db: str):
    """Execute the complete ETL pipeline."""
    print("=" * 60)
    print("Sakila JSON → MongoDB Transformation")
    print("=" * 60)

    # Load JSON files
    print(f"\n[1/6] Loading JSON files from {input_dir}...")
    loader = SakilaJsonLoader(input_dir)

    # Pre-load lookup tables
    _ = loader.countries
    _ = loader.cities
    _ = loader.addresses
    _ = loader.languages
    _ = loader.actors
    _ = loader.categories
    _ = loader.films
    _ = loader.customers
    _ = loader.staff
    _ = loader.stores
    _ = loader.inventory
    _ = loader.film_actors
    _ = loader.film_categories

    # Connect to MongoDB
    print(f"\n[2/6] Connecting to MongoDB ({mongo_uri})...")
    writer = MongoWriter(mongo_uri, mongo_db)

    # Build and write films
    print("\n[3/6] Building films collection...")
    films = FilmsBuilder(loader).build_all()
    count = writer.write_collection("films", films, [
        ("film_id", 1),
        ("title", "text"),
        ("rating", 1),
        ("categories.name", 1),
        ("actors.actor_id", 1),
    ])
    print(f"    Inserted {count} films")

    # Build and write customers
    print("\n[4/6] Building customers collection...")
    customers = CustomersBuilder(loader).build_all()
    count = writer.write_collection("customers", customers, [
        ("customer_id", 1),
        ("email", 1),
        ("address.city.city", 1),
        ("address.country.country", 1),
    ])
    print(f"    Inserted {count} customers")

    # Build and write stores
    print("\n[5/6] Building stores collection...")
    stores = StoresBuilder(loader).build_all()
    count = writer.write_collection("stores", stores, [
        ("store_id", 1),
    ])
    print(f"    Inserted {count} stores")

    # Build and write rentals
    print("\n[6/6] Building rentals collection...")
    rentals = RentalsBuilder(loader).build_all()
    count = writer.write_collection("rentals", rentals, [
        ("rental_id", 1),
        ("rental_date", -1),
        ("customer_id", 1),
        ("film_id", 1),
        ("staff_id", 1),
        ("store_id", 1),
    ])
    print(f"    Inserted {count} rentals")

    writer.close()

    print("\n" + "=" * 60)
    print("ETL Complete!")
    print(f"Database: {mongo_db}")
    print("Collections: films, customers, stores, rentals")
    print("=" * 60)


# =============================================================================
# Example Queries
# =============================================================================

EXAMPLE_QUERIES = """
# =============================================================================
# Example MongoDB Queries
# =============================================================================

# -----------------------------------------------------------------------------
# FILMS COLLECTION
# -----------------------------------------------------------------------------

# Find all Sci-Fi films
db.films.find({"categories.name": "Sci-Fi"})

# Films in a specific language
db.films.find({"spoken_language.name": "English"})

# Full-text search on title
db.films.find({$text: {$search: "dinosaur"}})

# Films with a specific actor
db.films.find({"actors.last_name": "GUINESS"})

# Films by rating with actor count
db.films.aggregate([
    {$project: {
        title: 1,
        rating: 1,
        actor_count: {$size: "$actors"}
    }},
    {$sort: {actor_count: -1}},
    {$limit: 10}
])

# -----------------------------------------------------------------------------
# CUSTOMERS COLLECTION
# -----------------------------------------------------------------------------

# Find customer by email
db.customers.find({"email": "MARY.SMITH@sakilacustomer.org"})

# Customers by country
db.customers.aggregate([
    {$group: {
        _id: "$address.country.country",
        count: {$sum: 1}
    }},
    {$sort: {count: -1}}
])

# -----------------------------------------------------------------------------
# RENTALS COLLECTION (with $lookup joins)
# -----------------------------------------------------------------------------

# Rental with customer and film details
db.rentals.aggregate([
    {$match: {rental_id: 1}},
    {$lookup: {
        from: "customers",
        localField: "customer_id",
        foreignField: "customer_id",
        as: "customer"
    }},
    {$lookup: {
        from: "films",
        localField: "film_id",
        foreignField: "film_id",
        as: "film"
    }},
    {$unwind: "$customer"},
    {$unwind: "$film"},
    {$project: {
        rental_date: 1,
        return_date: 1,
        "customer.first_name": 1,
        "customer.last_name": 1,
        "film.title": 1,
        payments: 1
    }}
])

# Total revenue by film
db.rentals.aggregate([
    {$unwind: "$payments"},
    {$group: {
        _id: "$film_id",
        total_revenue: {$sum: "$payments.amount"},
        rental_count: {$sum: 1}
    }},
    {$lookup: {
        from: "films",
        localField: "_id",
        foreignField: "film_id",
        as: "film"
    }},
    {$unwind: "$film"},
    {$project: {
        title: "$film.title",
        total_revenue: 1,
        rental_count: 1
    }},
    {$sort: {total_revenue: -1}},
    {$limit: 10}
])

# Monthly revenue
db.rentals.aggregate([
    {$unwind: "$payments"},
    {$group: {
        _id: {
            year: {$year: "$payments.payment_date"},
            month: {$month: "$payments.payment_date"}
        },
        revenue: {$sum: "$payments.amount"}
    }},
    {$sort: {"_id.year": 1, "_id.month": 1}}
])

# Customer rental history
db.rentals.aggregate([
    {$match: {customer_id: 1}},
    {$lookup: {
        from: "films",
        localField: "film_id",
        foreignField: "film_id",
        as: "film"
    }},
    {$unwind: "$film"},
    {$project: {
        rental_date: 1,
        return_date: 1,
        title: "$film.title",
        total_paid: {$sum: "$payments.amount"}
    }},
    {$sort: {rental_date: -1}}
])

# Top customers by spending
db.rentals.aggregate([
    {$unwind: "$payments"},
    {$group: {
        _id: "$customer_id",
        total_spent: {$sum: "$payments.amount"},
        rental_count: {$sum: 1}
    }},
    {$lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "customer_id",
        as: "customer"
    }},
    {$unwind: "$customer"},
    {$project: {
        name: {$concat: ["$customer.first_name", " ", "$customer.last_name"]},
        email: "$customer.email",
        total_spent: 1,
        rental_count: 1
    }},
    {$sort: {total_spent: -1}},
    {$limit: 10}
])
"""


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Transform Sakila JSON files to MongoDB"
    )
    parser.add_argument(
        "--input", "-i",
        type=Path,
        default=Path("./sakila_json"),
        help="Directory containing JSON files (default: ./sakila_json)"
    )
    parser.add_argument(
        "--uri", "-u",
        type=str,
        default="mongodb://localhost:27017",
        help="MongoDB connection URI (default: mongodb://localhost:27017)"
    )
    parser.add_argument(
        "--database", "-d",
        type=str,
        default="sakila",
        help="MongoDB database name (default: sakila)"
    )
    parser.add_argument(
        "--queries", "-q",
        action="store_true",
        help="Print example queries after ETL"
    )

    args = parser.parse_args()

    run_etl(args.input, args.uri, args.database)

    if args.queries:
        print(EXAMPLE_QUERIES)
