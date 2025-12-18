"""
Pytest configuration file for MongoDB Faker Generator tests
"""

import pytest
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import sys
import os
from faker import Faker

try:
    import mongomock
except ImportError:  # pragma: no cover - mongomock installed via requirements
    mongomock = None

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Test configuration
TEST_DB_NAME = "database_test_db"
TEST_MONGO_URI = os.environ.get("TEST_MONGO_URI", "mongodb://localhost:27017/")


@pytest.fixture(scope="session")
def faker_instance():
    """Provide a configured Faker instance"""
    fake = Faker("pt_PT")
    Faker.seed(12345)  # Seed for reproducible tests
    return fake


def _create_mongo_client(uri: str) -> MongoClient:
    """
    Create a MongoDB client. Falls back to mongomock when MongoDB
    is unavailable so the suite can run without a running server.
    """
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=1000)
        client.admin.command("ping")
        return client
    except ServerSelectionTimeoutError:
        if mongomock is None:
            raise
        return mongomock.MongoClient()


@pytest.fixture(scope="session")
def mongo_client():
    """Create a MongoDB client for the test session"""
    client = _create_mongo_client(TEST_MONGO_URI)
    yield client
    client.close()


@pytest.fixture(scope="session")
def test_database(mongo_client):
    """Provide test database, clean up after session"""
    db = mongo_client[TEST_DB_NAME]
    yield db
    # Clean up after all tests
    mongo_client.drop_database(TEST_DB_NAME)


@pytest.fixture
def clean_db(test_database):
    """Clean database before each test"""
    # Drop all collections before test
    for collection_name in test_database.list_collection_names():
        test_database[collection_name].drop()
    yield test_database
    # Optional: Clean after test as well
    for collection_name in test_database.list_collection_names():
        test_database[collection_name].drop()


@pytest.fixture
def sample_users():
    """Provide sample user data for tests"""
    from python.generate_fake_data import generate_users

    return generate_users(5)


@pytest.fixture
def sample_products():
    """Provide sample product data for tests"""
    from python.generate_fake_data import generate_products

    return generate_products(10)


@pytest.fixture
def sample_transactions(sample_users, sample_products):
    """Provide sample transaction data for tests"""
    from python.generate_fake_data import generate_transactions

    return generate_transactions(sample_users, sample_products, 15)


@pytest.fixture
def sample_logs(sample_users):
    """Provide sample log data for tests"""
    from python.generate_fake_data import generate_logs

    return generate_logs(sample_users, 50)


# Pytest configuration options
def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line("markers", "integration: marks tests as integration tests")
    config.addinivalue_line("markers", "unit: marks tests as unit tests")


# Test collection modification
def pytest_collection_modifyitems(config, items):
    """Automatically mark tests based on their location"""
    for item in items:
        # Mark integration tests
        if "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        # Mark validation tests as unit tests
        elif "validation" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        # Mark data generation tests as unit tests
        elif "data_generation" in str(item.fspath):
            item.add_marker(pytest.mark.unit)


# Add custom command line options
def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption(
        "--runslow", action="store_true", default=False, help="run slow tests"
    )
    parser.addoption(
        "--mongo-uri",
        action="store",
        default=TEST_MONGO_URI,
        help="MongoDB URI for tests",
    )


# Skip slow tests unless --runslow is passed
def pytest_runtest_setup(item):
    """Skip tests based on markers"""
    if "slow" in item.keywords and not item.config.getoption("--runslow"):
        pytest.skip("need --runslow option to run")
