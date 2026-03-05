"""Tests for scripts/validate_data.py without requiring MongoDB."""

import os
import sys
from datetime import datetime, timedelta


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.append(ROOT)

from scripts import validate_data  # noqa: E402


class CountableCursor:
    def __init__(self, count_value=0):
        self._count_value = count_value

    def count(self):
        return self._count_value


class FakeCollection:
    def __init__(
        self,
        aggregate_result=None,
        find_count=0,
        count_documents_value=0,
        find_docs=None,
    ):
        self._aggregate_result = aggregate_result or []
        self._find_count = find_count
        self._count_documents_value = count_documents_value
        self._find_docs = find_docs or []

    def aggregate(self, _pipeline):
        return self._aggregate_result

    def find(self, _query, _projection=None):
        if _projection is not None:
            return list(self._find_docs)
        return CountableCursor(self._find_count)

    def count_documents(self, _query):
        return self._count_documents_value


class FakeDB:
    def __init__(self, users, products, transactions, logs):
        self.users = users
        self.products = products
        self.transactions = transactions
        self.logs = logs


def test_validate_data_all_passed(monkeypatch, tmp_path):
    """Validation should pass when collections are clean."""
    users = FakeCollection(
        aggregate_result=[],
        find_count=0,
        count_documents_value=10,
        find_docs=[{"_id": "u1"}, {"_id": "u2"}],
    )
    products = FakeCollection(find_count=0, count_documents_value=5)
    transactions = FakeCollection(find_count=0, count_documents_value=8, aggregate_result=[])
    logs = FakeCollection(find_count=0, count_documents_value=12)
    fake_db = FakeDB(users, products, transactions, logs)

    monkeypatch.setattr(validate_data, "db", fake_db)
    monkeypatch.chdir(tmp_path)

    validate_data.main()

    report_path = tmp_path / "validation_report.json"
    assert report_path.exists()


def test_validate_data_flags_issues(monkeypatch):
    """Validation should report issues when collections have problems."""
    users = FakeCollection(
        aggregate_result=[{"_id": "dup@example.com", "count": 2}],
        find_count=3,
        count_documents_value=10,
        find_docs=[{"_id": "u1"}],
    )
    products = FakeCollection(find_count=2, count_documents_value=5)
    transactions = FakeCollection(
        find_count=1,
        count_documents_value=8,
        aggregate_result=[{"orderId": "o1"}],
    )
    logs = FakeCollection(find_count=4, count_documents_value=12)
    fake_db = FakeDB(users, products, transactions, logs)

    monkeypatch.setattr(validate_data, "db", fake_db)

    assert validate_data.validate_users() is False
    assert validate_data.validate_products() is False
    assert validate_data.validate_transactions() is False
    assert validate_data.validate_logs() is False
