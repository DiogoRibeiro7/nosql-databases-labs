"""Targeted branch-coverage tests for generate_fake_data helpers."""

import os
import sys

import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.append(ROOT)

from python import generate_fake_data as fake_data  # noqa: E402


def test_faker_attr_uses_provider():
    """_faker_attr should use the faker provider when available."""
    sentinel = "should-not-be-used"

    def fallback():
        return sentinel

    value = fake_data._faker_attr("city", fallback)
    assert value != sentinel


def test_generate_products_discount_and_out_of_stock(monkeypatch):
    """Force discount and out-of-stock branches in generate_products."""
    bool_sequence = iter([True, False])

    def controlled_boolean(*_args, **_kwargs):
        return next(bool_sequence)

    monkeypatch.setattr(fake_data.fake, "boolean", controlled_boolean)
    monkeypatch.setattr(fake_data.fake.random, "uniform", lambda *_args, **_kwargs: 10.0)

    products = fake_data.generate_products(1)
    assert len(products) == 1

    product = products[0]
    assert product["price"]["discount"] == 10.0
    assert product["inventory"]["inStock"] is False
    assert product["inventory"]["quantity"] == 0


def test_generate_transactions_delivered_forces_payment_complete(monkeypatch):
    """Delivered transactions should force payment status to completed."""

    def controlled_random_element(options):
        if options == ["pending", "processing", "shipped", "delivered", "cancelled"]:
            return "delivered"
        if options == ["pending", "completed", "failed"]:
            return "failed"
        if options == ["standard", "express", "overnight"]:
            return "standard"
        if options == [
            "credit_card",
            "debit_card",
            "paypal",
            "mbway",
            "bank_transfer",
        ]:
            return "credit_card"
        if options and isinstance(options[0], dict):
            return options[0]
        return options[0]

    monkeypatch.setattr(fake_data.fake, "random_element", controlled_random_element)
    monkeypatch.setattr(fake_data.fake, "boolean", lambda *_args, **_kwargs: False)

    users = [{"_id": "user-1"}]
    products = [{"sku": "sku-1", "name": "Item", "price": {"amount": 5.0}}]

    transactions = fake_data.generate_transactions(users, products, 1)
    assert transactions[0]["status"] == "delivered"
    assert transactions[0]["payment"]["status"] == "completed"
    assert transactions[0]["shipping"]["trackingNumber"] is None


def test_generate_transactions_shipped_failed_transitions(monkeypatch):
    """Shipped + failed payments should transition to a recoverable status."""

    def controlled_random_element(options):
        if options == ["pending", "processing", "shipped", "delivered", "cancelled"]:
            return "shipped"
        if options == ["pending", "completed", "failed"]:
            return "failed"
        if options == ["processing", "cancelled"]:
            return "processing"
        if options == ["standard", "express", "overnight"]:
            return "express"
        if options == [
            "credit_card",
            "debit_card",
            "paypal",
            "mbway",
            "bank_transfer",
        ]:
            return "paypal"
        if options and isinstance(options[0], dict):
            return options[0]
        return options[0]

    monkeypatch.setattr(fake_data.fake, "random_element", controlled_random_element)

    users = [{"_id": "user-1"}]
    products = [{"sku": "sku-1", "name": "Item", "price": {"amount": 5.0}}]

    transactions = fake_data.generate_transactions(users, products, 1)
    assert transactions[0]["payment"]["status"] == "failed"
    assert transactions[0]["status"] == "processing"
