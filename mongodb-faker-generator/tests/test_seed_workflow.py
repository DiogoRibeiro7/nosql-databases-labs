"""Additional coverage for generate_fake_data workflow helpers."""

import os
import sys
from datetime import datetime


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.append(ROOT)

from python import generate_fake_data as fake_data  # noqa: E402


class FakeCursor:
    """Minimal cursor supporting .limit() and iteration."""

    def __init__(self, documents):
        self._documents = list(documents)

    def limit(self, size):
        return FakeCursor(self._documents[:size])

    def __iter__(self):
        return iter(self._documents)


class RecordingCollection:
    """Record drop/insert/index operations issued by the seeding logic."""

    def __init__(self, name):
        self.name = name
        self.dropped = False
        self.inserted_docs = []
        self.created_indexes = []

    def drop(self):
        self.dropped = True

    def insert_many(self, docs):
        self.inserted_docs = list(docs)

    def create_index(self, spec, **kwargs):
        self.created_indexes.append((tuple(spec), kwargs))


class RecordingDB:
    """Dictionary-like object returning deterministic collections."""

    def __init__(self):
        self.collections = {
            "users": RecordingCollection("users"),
            "products": RecordingCollection("products"),
            "transactions": RecordingCollection("transactions"),
            "logs": RecordingCollection("logs"),
        }

    def __getitem__(self, name):
        return self.collections[name]

    def command(self, cmd):
        assert cmd == "dbstats"
        return {"db": "fake", "collections": len(self.collections), "dataSize": 1024}


class QueryCollection:
    """Provide canned responses for find/count/aggregate queries."""

    def __init__(self, docs=None, count=0, aggregate_res=None):
        self.docs = docs or []
        self.count_value = count
        self.aggregate_res = aggregate_res or []
        self.last_find = None
        self.last_count_query = None
        self.last_pipeline = None

    def find(self, query):
        self.last_find = query
        return FakeCursor(self.docs)

    def count_documents(self, query):
        self.last_count_query = query
        return self.count_value

    def aggregate(self, pipeline):
        self.last_pipeline = pipeline
        return self.aggregate_res


class QueryDB:
    """Expose both dict access (for insert) and attribute access (for queries)."""

    def __init__(self):
        self.collections = {
            "users": QueryCollection(docs=[{"_id": "u1"} for _ in range(3)]),
            "products": QueryCollection(docs=[{"sku": "p1"} for _ in range(4)]),
            "transactions": QueryCollection(
                docs=[{"orderId": "o1"} for _ in range(2)],
                aggregate_res=[
                    {"_id": "Electronics", "totalSales": 100.0, "count": 2},
                    {"_id": "Books", "totalSales": 50.0, "count": 1},
                ],
            ),
            "logs": QueryCollection(count=7),
        }

    def __getitem__(self, name):
        return self.collections[name]

    def __getattr__(self, name):
        try:
            return self.collections[name]
        except KeyError as exc:
            raise AttributeError(name) from exc


def test_faker_attr_fallback():
    """_faker_attr should invoke the provided fallback when provider is missing."""
    sentinel = "fallback-value"
    result = fake_data._faker_attr("non_existing_provider", lambda: sentinel)
    assert result == sentinel


def test_insert_data_to_mongodb_records_operations(monkeypatch):
    """insert_data_to_mongodb should drop, insert, and index every collection."""
    recording_db = RecordingDB()
    monkeypatch.setattr(fake_data, "db", recording_db)

    user_stub = {
        "_id": "user-1",
        "email": "user@example.com",
        "username": "user",
        "profile": {"address": {"coordinates": [0.0, 0.0]}},
        "account": {
            "type": "free",
            "status": "active",
            "createdAt": datetime.utcnow(),
            "lastLogin": datetime.utcnow(),
            "loginCount": 0,
            "preferences": {},
        },
        "tags": [],
        "metadata": {},
    }
    product_stub = {
        "sku": "sku-1",
        "name": "Sample",
        "description": "desc",
        "category": "Books",
        "subcategory": "Fiction",
        "brand": "Brand",
        "price": {"amount": 10, "currency": "EUR", "discount": 0},
        "inventory": {"inStock": True, "quantity": 5, "warehouse": "Porto"},
        "attributes": {"weight": "1kg", "dimensions": {"length": 1}},
        "ratings": {"average": 5, "count": 1},
        "images": [],
        "tags": [],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    transaction_stub = {
        "orderId": "order-1",
        "userId": "user-1",
        "status": "delivered",
        "items": [
            {
                "productSku": "sku-1",
                "productName": "Sample",
                "quantity": 1,
                "unitPrice": 10,
                "total": 10,
            }
        ],
        "payment": {"method": "credit_card", "status": "completed", "transactionId": "abc"},
        "shipping": {
            "address": {"street": "Street", "city": "City", "postalCode": "1111-111", "country": "PT"},
            "method": "standard",
            "trackingNumber": None,
        },
        "totals": {"subtotal": 10, "tax": 2.3, "shipping": 0, "total": 12.3},
        "timestamps": {"created": datetime.utcnow(), "updated": datetime.utcnow()},
    }
    log_stub = {
        "timestamp": datetime.utcnow(),
        "level": "INFO",
        "type": "login",
        "userId": "user-1",
        "sessionId": "sess",
        "message": "hello",
        "metadata": {},
        "error": {"type": None, "stack": None},
    }

    monkeypatch.setattr(fake_data, "generate_users", lambda n=100: [user_stub])
    monkeypatch.setattr(fake_data, "generate_products", lambda n=500: [product_stub])
    monkeypatch.setattr(
        fake_data,
        "generate_transactions",
        lambda users, products, n=1000: [transaction_stub],
    )
    monkeypatch.setattr(fake_data, "generate_logs", lambda users, n=5000: [log_stub])

    fake_data.insert_data_to_mongodb()

    users_collection = recording_db["users"]
    assert users_collection.dropped
    assert users_collection.inserted_docs == [user_stub]
    product_indexes = recording_db["products"].created_indexes
    assert any(("sku", 1) in spec for spec, _ in product_indexes)
    log_indexes = recording_db["logs"].created_indexes
    assert any(spec[0][0] == "timestamp" for spec, _ in log_indexes)


def test_query_examples_runs_with_fake_db(monkeypatch):
    """query_examples should issue the expected filters without hitting MongoDB."""
    query_db = QueryDB()
    monkeypatch.setattr(fake_data, "db", query_db)

    fake_data.query_examples()

    assert query_db.collections["users"].last_find == {
        "account.type": "premium",
        "profile.address.city": "Porto",
    }
    assert query_db.collections["products"].last_find == {"ratings.average": {"$gte": 4.5}}
    assert query_db.collections["logs"].last_count_query == {"level": "ERROR"}
    assert query_db.collections["transactions"].last_pipeline is not None
