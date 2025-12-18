"""Unit tests covering the pure data-generation helpers (no MongoDB calls)."""

import pytest
from faker import Faker
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from python.generate_fake_data import (
    generate_users,
    generate_products,
    generate_transactions,
    generate_logs,
)

fake = Faker('pt_PT')

def test_generate_users():
    """Test user generation"""
    users = generate_users(5)
    assert len(users) == 5
    
    user = users[0]
    assert '_id' in user
    assert 'username' in user
    assert 'email' in user
    assert '@' in user['email']
    assert 'profile' in user
    assert 'account' in user
    assert user['account']['type'] in ['free', 'premium', 'enterprise']

def test_generate_products():
    """Test product generation"""
    products = generate_products(10)
    assert len(products) == 10
    
    product = products[0]
    assert 'sku' in product
    assert 'name' in product
    assert 'price' in product
    assert product['price']['amount'] > 0
    assert product['price']['currency'] == 'EUR'

def test_generate_transactions():
    """Test transaction generation"""
    users = generate_users(5)
    products = generate_products(10)
    transactions = generate_transactions(users, products, 20)
    
    assert len(transactions) == 20
    
    transaction = transactions[0]
    assert 'orderId' in transaction
    assert 'userId' in transaction
    assert 'items' in transaction
    assert len(transaction['items']) > 0
    assert transaction['totals']['total'] > 0

def test_data_relationships():
    """Test that relationships between collections are valid"""
    users = generate_users(5)
    products = generate_products(10)
    transactions = generate_transactions(users, products, 20)
    
    user_ids = {user['_id'] for user in users}
    product_skus = {product['sku'] for product in products}
    
    for transaction in transactions:
        assert transaction['userId'] in user_ids
        for item in transaction['items']:
            assert item['productSku'] in product_skus

def test_generate_logs_structure_and_relationships():
    """Logs should include metadata and reference known users when present."""
    users = generate_users(5)
    logs = generate_logs(users, 25)

    assert len(logs) == 25
    user_ids = {user['_id'] for user in users}
    allowed_levels = {"INFO", "DEBUG", "WARNING", "ERROR", "CRITICAL"}
    allowed_methods = {"GET", "POST", "PUT", "DELETE"}
    allowed_codes = {200, 201, 400, 401, 403, 404, 500}

    for entry in logs:
        assert 'timestamp' in entry
        assert entry['level'] in allowed_levels
        assert entry['type'] in {"login", "logout", "page_view", "api_call", "error", "performance"}
        if entry['userId'] is not None:
            assert entry['userId'] in user_ids
        metadata = entry['metadata']
        assert metadata['method'] in allowed_methods
        assert metadata['statusCode'] in allowed_codes
        assert metadata['endpoint'].startswith('/api/')
        error_block = entry['error']
        assert 'type' in error_block and 'stack' in error_block
