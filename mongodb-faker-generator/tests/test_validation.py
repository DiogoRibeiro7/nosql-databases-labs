"""Validation-focused tests to ensure generated payloads obey business rules."""

import pytest
from datetime import datetime, timedelta
import sys
import os
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from python.generate_fake_data import (
    generate_users,
    generate_products,
    generate_transactions,
    generate_logs,
)


class TestDataValidation:
    """Test data validation and quality"""

    def test_user_email_validation(self):
        """Test that all user emails are valid"""
        users = generate_users(50)
        email_regex = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")

        for user in users:
            assert email_regex.match(user["email"]), f"Invalid email: {user['email']}"
            assert "@" in user["email"]
            assert "." in user["email"].split("@")[1]

    def test_user_required_fields(self):
        """Test that all required user fields are present"""
        users = generate_users(20)
        required_fields = [
            "_id",
            "username",
            "email",
            "profile",
            "account",
            "tags",
            "metadata",
        ]
        required_profile_fields = [
            "firstName",
            "lastName",
            "fullName",
            "birthDate",
            "address",
        ]
        required_account_fields = [
            "type",
            "status",
            "createdAt",
            "lastLogin",
            "preferences",
        ]

        for user in users:
            # Check top-level fields
            for field in required_fields:
                assert field in user, f"Missing field: {field}"

            # Check profile fields
            for field in required_profile_fields:
                assert field in user["profile"], f"Missing profile field: {field}"

            # Check account fields
            for field in required_account_fields:
                assert field in user["account"], f"Missing account field: {field}"

    def test_user_data_constraints(self):
        """Test user data constraints and business rules"""
        users = generate_users(100)

        for user in users:
            # Account type validation
            assert user["account"]["type"] in ["free", "premium", "enterprise"]
            assert user["account"]["status"] in ["active", "inactive", "suspended"]

            # Age validation (18-80 years old)
            birth_date = user["profile"]["birthDate"]
            age = (datetime.now() - birth_date).days / 365.25
            assert 18 <= age <= 80, f"Invalid age: {age}"

            # Login count should be non-negative
            assert user["account"]["loginCount"] >= 0

            # Coordinates validation
            coords = user["profile"]["address"]["coordinates"]["coordinates"]
            assert -180 <= coords[0] <= 180, f"Invalid longitude: {coords[0]}"
            assert -90 <= coords[1] <= 90, f"Invalid latitude: {coords[1]}"

            # Tags should be a non-empty list
            assert isinstance(user["tags"], list)
            assert len(user["tags"]) > 0

    def test_product_price_validation(self):
        """Test product pricing rules"""
        products = generate_products(100)

        for product in products:
            # Price should be positive
            assert product["price"]["amount"] > 0
            assert product["price"]["currency"] == "EUR"

            # Discount should be between 0 and 100
            assert 0 <= product["price"]["discount"] <= 100

            # If discounted price exists, it should be less than original
            if product["price"]["discount"] > 0:
                discounted_price = product["price"]["amount"] * (
                    1 - product["price"]["discount"] / 100
                )
                assert discounted_price < product["price"]["amount"]

    def test_product_inventory_consistency(self):
        """Test inventory data consistency"""
        products = generate_products(100)

        for product in products:
            # If not in stock, quantity should be 0
            if not product["inventory"]["inStock"]:
                assert (
                    product["inventory"]["quantity"] == 0
                    or product["inventory"]["quantity"] is None
                )

            # Quantity should be non-negative
            assert product["inventory"]["quantity"] >= 0

            # Warehouse should be valid
            assert product["inventory"]["warehouse"] in ["Porto", "Lisboa", "Faro"]

    def test_product_ratings_validation(self):
        """Test product ratings constraints"""
        products = generate_products(100)

        for product in products:
            # Rating should be between 1 and 5
            assert 1 <= product["ratings"]["average"] <= 5

            # Rating count should be non-negative
            assert product["ratings"]["count"] >= 0

            # If no ratings, average could be None or default
            if product["ratings"]["count"] == 0:
                assert product["ratings"]["average"] >= 1

    def test_transaction_totals_calculation(self):
        """Test transaction total calculations"""
        users = generate_users(5)
        products = generate_products(20)
        transactions = generate_transactions(users, products, 50)

        for transaction in transactions:
            # Recalculate totals
            calculated_subtotal = sum(item["total"] for item in transaction["items"])

            # Check subtotal (allow small floating point differences)
            assert abs(calculated_subtotal - transaction["totals"]["subtotal"]) < 0.01

            # Check tax calculation (23% Portuguese VAT)
            expected_tax = transaction["totals"]["subtotal"] * 0.23
            assert abs(expected_tax - transaction["totals"]["tax"]) < 0.01

            # Check total
            expected_total = (
                transaction["totals"]["subtotal"]
                + transaction["totals"]["tax"]
                + transaction["totals"]["shipping"]
            )
            assert abs(expected_total - transaction["totals"]["total"]) < 0.01

            # Shipping should be non-negative
            assert transaction["totals"]["shipping"] >= 0

    def test_transaction_item_validation(self):
        """Test transaction item data integrity"""
        users = generate_users(5)
        products = generate_products(20)
        transactions = generate_transactions(users, products, 30)

        product_map = {p["sku"]: p for p in products}

        for transaction in transactions:
            assert len(transaction["items"]) > 0, (
                "Transaction must have at least one item"
            )

            for item in transaction["items"]:
                # Quantity should be positive
                assert item["quantity"] > 0

                # Unit price should match product price
                if item["productSku"] in product_map:
                    product = product_map[item["productSku"]]
                    # Allow for discounts
                    assert item["unitPrice"] <= product["price"]["amount"]

                # Item total should be quantity * unit price
                expected_total = item["quantity"] * item["unitPrice"]
                assert abs(expected_total - item["total"]) < 0.01

    def test_transaction_status_workflow(self):
        """Test transaction status constraints"""
        users = generate_users(5)
        products = generate_products(10)
        transactions = generate_transactions(users, products, 100)

        valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        valid_payment_statuses = ["pending", "completed", "failed"]

        for transaction in transactions:
            assert transaction["status"] in valid_statuses
            assert transaction["payment"]["status"] in valid_payment_statuses

            # Business rules
            if transaction["status"] == "delivered":
                # Delivered orders should have completed payment
                assert transaction["payment"]["status"] == "completed"

            if transaction["status"] == "cancelled":
                # Cancelled orders might have failed payment
                assert transaction["payment"]["status"] in [
                    "failed",
                    "pending",
                    "completed",
                ]

    def test_log_timestamp_validation(self):
        """Test log timestamp constraints"""
        users = generate_users(5)
        logs = generate_logs(users, 100)

        now = datetime.now()
        seven_days_ago = now - timedelta(days=7)

        for log in logs:
            # Timestamp should be within last 7 days
            assert seven_days_ago <= log["timestamp"] <= now

            # Timestamp should be a datetime object
            assert isinstance(log["timestamp"], datetime)

    def test_log_level_distribution(self):
        """Test log level distribution is reasonable"""
        users = generate_users(5)
        logs = generate_logs(users, 1000)

        level_counts = {}
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]

        for log in logs:
            assert log["level"] in valid_levels
            level_counts[log["level"]] = level_counts.get(log["level"], 0) + 1

        # INFO should be most common
        assert level_counts.get("INFO", 0) > level_counts.get("CRITICAL", 0)

        # Should have all levels represented in large sample
        assert len(level_counts) == len(valid_levels)

    def test_log_metadata_validation(self):
        """Test log metadata constraints"""
        users = generate_users(5)
        logs = generate_logs(users, 50)

        valid_methods = ["GET", "POST", "PUT", "DELETE"]
        valid_status_codes = [200, 201, 400, 401, 403, 404, 500]

        for log in logs:
            # HTTP method validation
            assert log["metadata"]["method"] in valid_methods

            # Status code validation
            assert log["metadata"]["statusCode"] in valid_status_codes

            # Response time should be reasonable
            assert 0 < log["metadata"]["responseTime"] <= 10000  # Max 10 seconds
