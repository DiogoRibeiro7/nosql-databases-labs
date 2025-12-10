import pytest
from pymongo import MongoClient, ASCENDING, DESCENDING
import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from python.generate_fake_data import (
    generate_users,
    generate_products,
    generate_transactions,
    generate_logs,
)


class TestMongoDBIntegration:
    """Integration tests for MongoDB operations"""

    @pytest.fixture(scope="class")
    def mongo_client(self):
        """Create MongoDB client for tests"""
        client = MongoClient("mongodb://localhost:27017/")
        yield client
        client.close()

    @pytest.fixture(scope="class")
    def test_db(self, mongo_client):
        """Create test database"""
        db_name = "database_test_db"
        db = mongo_client[db_name]
        yield db
        # Cleanup after all tests
        mongo_client.drop_database(db_name)

    @pytest.fixture(autouse=True)
    def cleanup_collections(self, test_db):
        """Clean collections before each test"""
        for collection in test_db.list_collection_names():
            test_db[collection].drop()

    def test_user_insertion_with_indexes(self, test_db):
        """Test user insertion and index creation"""
        # Generate and insert users
        users = generate_users(10)
        collection = test_db["users"]
        result = collection.insert_many(users)

        assert result.inserted_ids
        assert len(result.inserted_ids) == 10

        # Create indexes
        collection.create_index([("email", ASCENDING)], unique=True)
        collection.create_index([("username", ASCENDING)], unique=True)
        collection.create_index([("profile.address.coordinates", "2dsphere")])

        # Verify indexes
        indexes = list(collection.list_indexes())
        index_names = [idx["name"] for idx in indexes]

        assert "email_1" in index_names
        assert "username_1" in index_names
        assert any("coordinates" in idx["name"] for idx in indexes)

        # Test unique constraint
        with pytest.raises(Exception):  # Should raise duplicate key error
            duplicate_user = users[0].copy()
            collection.insert_one(duplicate_user)

    def test_geospatial_queries(self, test_db):
        """Test geospatial functionality"""
        users = generate_users(50)
        collection = test_db["users_geo"]

        collection.insert_many(users)
        collection.create_index([("profile.address.coordinates", "2dsphere")])

        # Find users near Porto
        porto_coords = [-8.611, 41.1496]
        nearby_users = list(
            collection.find(
                {
                    "profile.address.coordinates": {
                        "$near": {
                            "$geometry": {"type": "Point", "coordinates": porto_coords},
                            "$maxDistance": 100000,  # 100km
                        }
                    }
                }
            ).limit(5)
        )

        assert isinstance(nearby_users, list)
        assert len(nearby_users) <= 5

        # Test geoWithin
        users_in_area = list(
            collection.find(
                {
                    "profile.address.coordinates": {
                        "$geoWithin": {
                            "$geometry": {
                                "type": "Polygon",
                                "coordinates": [
                                    [
                                        [-9.0, 40.5],
                                        [-8.0, 40.5],
                                        [-8.0, 42.0],
                                        [-9.0, 42.0],
                                        [-9.0, 40.5],
                                    ]
                                ],
                            }
                        }
                    }
                }
            )
        )

        assert isinstance(users_in_area, list)

    def test_text_search_on_products(self, test_db):
        """Test text search functionality"""
        products = generate_products(30)
        collection = test_db["products"]

        collection.insert_many(products)
        collection.create_index([("name", "text"), ("description", "text")])

        # Search for products
        search_results = list(
            collection.find({"$text": {"$search": "laptop computer"}})
        )

        # Results will vary, but structure should be correct
        assert isinstance(search_results, list)
        if search_results:
            assert all("name" in product for product in search_results)

    def test_transaction_aggregations(self, test_db):
        """Test complex aggregations"""
        # Setup test data
        users = generate_users(5)
        products = generate_products(20)
        transactions = generate_transactions(users, products, 50)

        test_db["users"].insert_many(users)
        test_db["products"].insert_many(products)
        test_db["transactions"].insert_many(transactions)

        # Test 1: Sales by status
        pipeline = [
            {
                "$group": {
                    "_id": "$status",
                    "totalRevenue": {"$sum": "$totals.total"},
                    "count": {"$sum": 1},
                    "avgOrderValue": {"$avg": "$totals.total"},
                }
            },
            {"$sort": {"totalRevenue": -1}},
        ]

        results = list(test_db["transactions"].aggregate(pipeline))

        assert len(results) > 0
        for result in results:
            assert "_id" in result
            assert "totalRevenue" in result
            assert "count" in result
            assert result["totalRevenue"] > 0

        # Test 2: User purchase summary with lookup
        pipeline = [
            {
                "$group": {
                    "_id": "$userId",
                    "totalOrders": {"$sum": 1},
                    "totalSpent": {"$sum": "$totals.total"},
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "userInfo",
                }
            },
            {"$unwind": "$userInfo"},
            {
                "$project": {
                    "username": "$userInfo.username",
                    "email": "$userInfo.email",
                    "totalOrders": 1,
                    "totalSpent": 1,
                }
            },
            {"$sort": {"totalSpent": -1}},
            {"$limit": 5},
        ]

        top_users = list(test_db["transactions"].aggregate(pipeline))

        assert len(top_users) <= 5
        for user in top_users:
            assert "username" in user
            assert "email" in user
            assert "totalOrders" in user
            assert user["totalOrders"] > 0

    def test_ttl_index_on_logs(self, test_db):
        """Test TTL index functionality"""
        users = generate_users(2)
        logs = generate_logs(users, 20)
        collection = test_db["logs"]

        collection.insert_many(logs)

        # Create TTL index
        collection.create_index(
            [("timestamp", ASCENDING)],
            expireAfterSeconds=30 * 24 * 60 * 60,  # 30 days
        )

        # Verify TTL index exists
        indexes = list(collection.list_indexes())
        ttl_index = next((idx for idx in indexes if "expireAfterSeconds" in idx), None)

        assert ttl_index is not None
        assert ttl_index["expireAfterSeconds"] == 30 * 24 * 60 * 60

    def test_bulk_operations_performance(self, test_db):
        """Test bulk insert performance"""
        import time

        # Generate large dataset
        users = generate_users(1000)

        # Time bulk insert
        start_time = time.time()
        result = test_db["users_bulk"].insert_many(users)
        end_time = time.time()

        assert len(result.inserted_ids) == 1000

        # Should complete in reasonable time (adjust based on your system)
        assert end_time - start_time < 5.0  # 5 seconds

        # Test batch processing
        batch_size = 100
        products = generate_products(500)

        for i in range(0, len(products), batch_size):
            batch = products[i : i + batch_size]
            result = test_db["products_batch"].insert_many(batch)
            assert len(result.inserted_ids) == len(batch)

    def test_data_relationships_integrity(self, test_db):
        """Test referential integrity between collections"""
        users = generate_users(10)
        products = generate_products(20)
        transactions = generate_transactions(users, products, 30)

        # Insert data
        test_db["users"].insert_many(users)
        test_db["products"].insert_many(products)
        test_db["transactions"].insert_many(transactions)

        # Get all user IDs and product SKUs
        valid_user_ids = {user["_id"] for user in users}
        valid_product_skus = {product["sku"] for product in products}

        # Check all transactions reference valid users and products
        for transaction in transactions:
            assert transaction["userId"] in valid_user_ids

            for item in transaction["items"]:
                assert item["productSku"] in valid_product_skus

        # Test orphaned transactions query
        orphaned = test_db["transactions"].count_documents(
            {"userId": {"$nin": list(valid_user_ids)}}
        )
        assert orphaned == 0
