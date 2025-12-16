"""Utility to build and seed a sample MongoDB dataset for demos/tests."""

from faker import Faker
from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
import random
from typing import List, Dict, Any

# Initialize Faker and MongoDB
fake = Faker("pt_PT")
client = MongoClient("mongodb://localhost:27017/")  # Adjust connection string as needed
db = client["database_demo"]  # Database name


def generate_users(n: int = 100) -> List[Dict[str, Any]]:
    """
    Generate complex user documents containing profile, account, and metadata info.

    Parameters
    ----------
    n : int, optional
        Number of user records to create.

    Returns
    -------
    list[dict]
        List of Mongo-style user documents ready for insertion.
    """
    users = []

    for _ in range(n):
        user = {
            "_id": fake.uuid4(),
            "username": fake.user_name(),
            "email": fake.email(),
            "profile": {
                "firstName": fake.first_name(),
                "lastName": fake.last_name(),
                "fullName": fake.name(),
                "avatar": fake.image_url(),
                "bio": fake.text(max_nb_chars=200),
                "birthDate": fake.date_of_birth(minimum_age=18, maximum_age=80),
                "gender": fake.random_element(["M", "F", "Other", None]),
                "phone": fake.phone_number(),
                "address": {
                    "street": fake.street_address(),
                    "city": fake.city(),
                    "state": fake.state(),
                    "country": "Portugal",
                    "postalCode": fake.postcode(),
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            float(fake.longitude()),
                            float(fake.latitude()),
                        ],
                    },
                },
            },
            "account": {
                "type": fake.random_element(["free", "premium", "enterprise"]),
                "status": fake.random_element(["active", "inactive", "suspended"]),
                "createdAt": fake.date_time_between(start_date="-3y", end_date="now"),
                "lastLogin": fake.date_time_between(start_date="-30d", end_date="now"),
                "loginCount": fake.random_int(min=0, max=1000),
                "preferences": {
                    "newsletter": fake.boolean(chance_of_getting_true=70),
                    "notifications": fake.boolean(chance_of_getting_true=80),
                    "language": fake.random_element(["pt", "en", "es"]),
                    "theme": fake.random_element(["light", "dark", "auto"]),
                },
            },
            "tags": fake.words(nb=random.randint(2, 6)),
            "metadata": {
                "source": fake.random_element(["web", "mobile", "api"]),
                "ipAddress": fake.ipv4(),
                "userAgent": fake.user_agent(),
            },
        }
        users.append(user)

    return users


def generate_products(n: int = 500) -> List[Dict[str, Any]]:
    """
    Generate product documents with nested pricing, inventory, and attribute fields.

    Parameters
    ----------
    n : int, optional
        Number of products to emit.
    """
    products = []
    categories = ["Electronics", "Books", "Clothing", "Home & Garden", "Sports", "Toys"]

    for _ in range(n):
        category = fake.random_element(categories)
        product = {
            "sku": fake.ean13(),
            "name": fake.catch_phrase(),
            "description": fake.paragraph(nb_sentences=5),
            "category": category,
            "subcategory": fake.word(),
            "brand": fake.company(),
            "price": {
                "amount": round(fake.random.uniform(10, 1000), 2),
                "currency": "EUR",
                "discount": round(fake.random.uniform(0, 30), 2)
                if fake.boolean(chance_of_getting_true=30)
                else 0,
            },
            "inventory": {
                "inStock": fake.boolean(chance_of_getting_true=85),
                "quantity": fake.random_int(min=0, max=1000),
                "warehouse": fake.random_element(["Porto", "Lisboa", "Faro"]),
            },
            "attributes": {
                "color": fake.color_name()
                if category in ["Clothing", "Home & Garden"]
                else None,
                "size": fake.random_element(["S", "M", "L", "XL"])
                if category == "Clothing"
                else None,
                "weight": f"{fake.random.uniform(0.1, 50):.2f} kg",
                "dimensions": {
                    "length": fake.random_int(min=10, max=200),
                    "width": fake.random_int(min=10, max=150),
                    "height": fake.random_int(min=5, max=100),
                    "unit": "cm",
                },
            },
            "ratings": {
                "average": round(fake.random.uniform(1, 5), 1),
                "count": fake.random_int(min=0, max=5000),
            },
            "images": [fake.image_url() for _ in range(fake.random_int(1, 5))],
            "tags": fake.words(nb=random.randint(3, 8)),
            "createdAt": fake.date_time_between(start_date="-2y", end_date="now"),
            "updatedAt": fake.date_time_between(start_date="-30d", end_date="now"),
        }
        products.append(product)

    return products


def generate_transactions(
    users: List[Dict], products: List[Dict], n: int = 1000
) -> List[Dict[str, Any]]:
    """
    Generate transactional orders that reference previously created users/products.

    Parameters
    ----------
    users : list[dict]
        User documents used to resolve userId references.
    products : list[dict]
        Product documents used to pull pricing/SKU details.
    n : int, optional
        Number of transactions to produce.
    """
    transactions = []

    for _ in range(n):
        num_items = fake.random_int(min=1, max=5)
        items = []
        total = 0

        for _ in range(num_items):
            product = fake.random_element(products)
            quantity = fake.random_int(min=1, max=3)
            item_price = product["price"]["amount"]
            items.append(
                {
                    "productSku": product["sku"],
                    "productName": product["name"],
                    "quantity": quantity,
                    "unitPrice": item_price,
                    "total": round(item_price * quantity, 2),
                }
            )
            total += item_price * quantity

        transaction = {
            "orderId": fake.uuid4(),
            "userId": fake.random_element(users)["_id"],
            "status": fake.random_element(
                ["pending", "processing", "shipped", "delivered", "cancelled"]
            ),
            "items": items,
            "payment": {
                "method": fake.random_element(
                    ["credit_card", "debit_card", "paypal", "mbway", "bank_transfer"]
                ),
                "status": fake.random_element(["pending", "completed", "failed"]),
                "transactionId": fake.sha256()[:16],
            },
            "shipping": {
                "address": {
                    "street": fake.street_address(),
                    "city": fake.city(),
                    "postalCode": fake.postcode(),
                    "country": "Portugal",
                },
                "method": fake.random_element(["standard", "express", "overnight"]),
                "trackingNumber": fake.ean13()
                if fake.boolean(chance_of_getting_true=70)
                else None,
                "estimatedDelivery": fake.future_date(end_date="+30d"),
            },
            "totals": {
                "subtotal": round(total, 2),
                "tax": round(total * 0.23, 2),  # Portuguese VAT for realistic totals
                "shipping": round(fake.random.uniform(0, 20), 2),
                "total": round(total * 1.23 + fake.random.uniform(0, 20), 2),
            },
            "timestamps": {
                "created": fake.date_time_between(start_date="-1y", end_date="now"),
                "updated": fake.date_time_between(start_date="-30d", end_date="now"),
            },
        }
        transactions.append(transaction)

    return transactions


def generate_logs(users: List[Dict], n: int = 5000) -> List[Dict[str, Any]]:
    """
    Generate application log entries for auth, API, and error events.

    Parameters
    ----------
    users : list[dict]
        Source user documents to associate optional userId values.
    n : int, optional
        Number of log entries to create.
    """
    log_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    log_types = ["login", "logout", "page_view", "api_call", "error", "performance"]

    logs = []
    for _ in range(n):
        log = {
            "timestamp": fake.date_time_between(start_date="-7d", end_date="now"),
            "level": fake.random_element(log_levels),
            "type": fake.random_element(log_types),
            "userId": fake.random_element(users)["_id"]
            if fake.boolean(chance_of_getting_true=80)
            else None,
            "sessionId": fake.uuid4(),
            "message": fake.sentence(),
            "metadata": {
                "ip": fake.ipv4(),
                "userAgent": fake.user_agent(),
                "endpoint": f"/api/{fake.word()}/{fake.word()}",
                "method": fake.random_element(["GET", "POST", "PUT", "DELETE"]),
                "statusCode": fake.random_element([200, 201, 400, 401, 403, 404, 500]),
                "responseTime": fake.random_int(min=10, max=3000),
            },
            "error": {
                "type": fake.word()
                if fake.boolean(chance_of_getting_true=20)
                else None,
                "stack": fake.paragraph()
                if fake.boolean(chance_of_getting_true=20)
                else None,
            },
        }
        logs.append(log)

    return logs


def insert_data_to_mongodb():
    """
    Regenerate every dataset, drop existing collections, insert data, and recreate indexes.
    """
    print("🔄 Generating fake data...")

    # Generate data
    users = generate_users(100)
    products = generate_products(500)
    transactions = generate_transactions(users, products, 1000)
    logs = generate_logs(users, 5000)

    print("📊 Data generated:")
    print(f"  - Users: {len(users)}")
    print(f"  - Products: {len(products)}")
    print(f"  - Transactions: {len(transactions)}")
    print(f"  - Logs: {len(logs)}")

    # Insert into MongoDB
    print("\n💾 Inserting into MongoDB...")

    # Users collection
    users_collection = db["users"]
    users_collection.drop()  # Clean existing data
    users_collection.insert_many(users)
    users_collection.create_index([("email", ASCENDING)], unique=True)
    users_collection.create_index([("username", ASCENDING)], unique=True)
    users_collection.create_index(
        [("profile.address.coordinates", "2dsphere")]
    )  # Geospatial index
    print("✅ Users inserted")

    # Products collection
    products_collection = db["products"]
    products_collection.drop()
    products_collection.insert_many(products)
    products_collection.create_index([("sku", ASCENDING)], unique=True)
    products_collection.create_index([("category", ASCENDING)])
    products_collection.create_index([("price.amount", ASCENDING)])
    products_collection.create_index(
        [("name", "text"), ("description", "text")]
    )  # Text search
    print("✅ Products inserted")

    # Transactions collection
    transactions_collection = db["transactions"]
    transactions_collection.drop()
    transactions_collection.insert_many(transactions)
    transactions_collection.create_index([("orderId", ASCENDING)], unique=True)
    transactions_collection.create_index([("userId", ASCENDING)])
    transactions_collection.create_index([("timestamps.created", DESCENDING)])
    print("✅ Transactions inserted")

    # Logs collection with TTL
    logs_collection = db["logs"]
    logs_collection.drop()
    logs_collection.insert_many(logs)
    logs_collection.create_index([("timestamp", DESCENDING)])
    logs_collection.create_index([("userId", ASCENDING)])
    logs_collection.create_index([("level", ASCENDING)])
    # TTL index - automatically delete logs older than 30 days
    logs_collection.create_index(
        [("timestamp", ASCENDING)], expireAfterSeconds=30 * 24 * 60 * 60
    )
    print("✅ Logs inserted")

    print("\n📈 Database statistics:")
    stats = db.command("dbstats")
    print(f"  - Database: {stats['db']}")
    print(f"  - Collections: {stats['collections']}")
    print(f"  - Data Size: {stats['dataSize'] / 1024 / 1024:.2f} MB")


def query_examples():
    """
    Run several read/report examples so students can validate the dataset interactively.
    """
    print("\n🔍 Example Queries:")

    # Example 1: Find premium users from Porto
    result = db.users.find(
        {"account.type": "premium", "profile.address.city": "Porto"}
    ).limit(5)
    print(f"\n1. Premium users from Porto: {len(list(result))}")

    # Example 2: Products with high ratings
    result = db.products.find({"ratings.average": {"$gte": 4.5}}).limit(5)
    print(f"2. Products with rating >= 4.5: {len(list(result))}")

    # Example 3: Recent large transactions
    result = db.transactions.find(
        {
            "totals.total": {"$gte": 500},
            "timestamps.created": {
                "$gte": datetime.now().replace(
                    hour=0, minute=0, second=0, microsecond=0
                )
            },
        }
    )
    print(f"3. Today's transactions over €500: {len(list(result))}")

    # Example 4: Error logs count
    result = db.logs.count_documents({"level": "ERROR"})
    print(f"4. Error logs: {result}")

    # Example 5: Aggregation - Sales by category
    pipeline = [
        {
            "$lookup": {
                "from": "products",
                "localField": "items.productSku",
                "foreignField": "sku",
                "as": "productDetails",
            }
        },
        {"$unwind": "$productDetails"},
        {
            "$group": {
                "_id": "$productDetails.category",
                "totalSales": {"$sum": "$totals.total"},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"totalSales": -1}},
    ]
    result = list(db.transactions.aggregate(pipeline))
    print("\n5. Sales by category:")
    for cat in result[:3]:
        print(
            f"   - {cat['_id']}: €{cat['totalSales']:.2f} ({cat['count']} transactions)"
        )


if __name__ == "__main__":
    try:
        insert_data_to_mongodb()
        query_examples()
        print("\n✅ All done! Check your MongoDB database.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()
