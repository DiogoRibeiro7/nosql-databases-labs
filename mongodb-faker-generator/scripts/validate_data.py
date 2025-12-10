#!/usr/bin/env python3
"""
Data validation script to ensure generated data meets quality standards
"""

from pymongo import MongoClient
from datetime import datetime
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["database_demo"]


def validate_users():
    """Validate users collection"""
    print("\n📋 Validating Users Collection...")
    issues = []

    # Check for duplicates
    pipeline = [
        {"$group": {"_id": "$email", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gt": 1}}},
    ]
    duplicates = list(db.users.aggregate(pipeline))
    if duplicates:
        issues.append(f"Found {len(duplicates)} duplicate emails")

    # Check required fields
    missing_fields = db.users.find(
        {
            "$or": [
                {"username": {"$exists": False}},
                {"email": {"$exists": False}},
                {"profile": {"$exists": False}},
            ]
        }
    ).count()
    if missing_fields:
        issues.append(f"Found {missing_fields} users with missing required fields")

    # Check data quality
    invalid_emails = db.users.find(
        {"email": {"$not": {"$regex": r"^[\w\.-]+@[\w\.-]+\.\w+$"}}}
    ).count()
    if invalid_emails:
        issues.append(f"Found {invalid_emails} invalid email addresses")

    total = db.users.count_documents({})
    if issues:
        print(f"❌ Users: {total} documents - Issues found:")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print(f"✅ Users: {total} documents - All validations passed")

    return len(issues) == 0


def validate_products():
    """Validate products collection"""
    print("\n📋 Validating Products Collection...")
    issues = []

    # Check price validity
    invalid_prices = db.products.find(
        {"$or": [{"price.amount": {"$lte": 0}}, {"price.amount": {"$exists": False}}]}
    ).count()
    if invalid_prices:
        issues.append(f"Found {invalid_prices} products with invalid prices")

    # Check inventory consistency
    inconsistent = db.products.find(
        {"$and": [{"inventory.inStock": True}, {"inventory.quantity": 0}]}
    ).count()
    if inconsistent:
        issues.append(
            f"Found {inconsistent} products marked as in stock with 0 quantity"
        )

    total = db.products.count_documents({})
    if issues:
        print(f"❌ Products: {total} documents - Issues found:")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print(f"✅ Products: {total} documents - All validations passed")

    return len(issues) == 0


def validate_transactions():
    """Validate transactions collection"""
    print("\n📋 Validating Transactions Collection...")
    issues = []

    # Check orphaned transactions
    user_ids = set(doc["_id"] for doc in db.users.find({}, {"_id": 1}))
    orphaned = db.transactions.find({"userId": {"$nin": list(user_ids)}}).count()
    if orphaned:
        issues.append(f"Found {orphaned} transactions with non-existent users")

    # Check total calculations
    pipeline = [
        {
            "$project": {
                "orderId": 1,
                "calculatedTotal": {"$sum": "$items.total"},
                "storedSubtotal": "$totals.subtotal",
                "difference": {
                    "$abs": {
                        "$subtract": [{"$sum": "$items.total"}, "$totals.subtotal"]
                    }
                },
            }
        },
        {"$match": {"difference": {"$gt": 0.01}}},
    ]
    miscalculated = list(db.transactions.aggregate(pipeline))
    if miscalculated:
        issues.append(
            f"Found {len(miscalculated)} transactions with calculation errors"
        )

    total = db.transactions.count_documents({})
    if issues:
        print(f"❌ Transactions: {total} documents - Issues found:")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print(f"✅ Transactions: {total} documents - All validations passed")

    return len(issues) == 0


def validate_logs():
    """Validate logs collection"""
    print("\n📋 Validating Logs Collection...")
    issues = []

    # Check timestamp validity
    future_logs = db.logs.find({"timestamp": {"$gt": datetime.now()}}).count()
    if future_logs:
        issues.append(f"Found {future_logs} logs with future timestamps")

    # Check log levels
    invalid_levels = db.logs.find(
        {"level": {"$nin": ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]}}
    ).count()
    if invalid_levels:
        issues.append(f"Found {invalid_levels} logs with invalid levels")

    total = db.logs.count_documents({})
    if issues:
        print(f"❌ Logs: {total} documents - Issues found:")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print(f"✅ Logs: {total} documents - All validations passed")

    return len(issues) == 0


def main():
    """Run all validations"""
    print("🔍 Starting Data Validation...\n")

    results = {
        "users": validate_users(),
        "products": validate_products(),
        "transactions": validate_transactions(),
        "logs": validate_logs(),
    }

    print("\n📊 Validation Summary:")
    all_passed = all(results.values())

    if all_passed:
        print("✅ All collections passed validation!")
    else:
        failed = [name for name, passed in results.items() if not passed]
        print(f"❌ Validation failed for: {', '.join(failed)}")

    # Save validation report
    report = {
        "timestamp": datetime.now().isoformat(),
        "database": "database_demo",
        "results": results,
        "all_passed": all_passed,
    }

    with open("validation_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("\n📄 Validation report saved to validation_report.json")


if __name__ == "__main__":
    main()
