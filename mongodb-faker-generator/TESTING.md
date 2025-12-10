# Testing Guide

This guide explains how to run tests for the MongoDB Faker Generator project in both Python and JavaScript.

## 📋 Prerequisites

### General Requirements

- MongoDB running locally on port 27017 (or Docker container)
- Node.js 18+ and Yarn (for JavaScript tests)
- Python 3.10+ (for Python tests)

### MongoDB Setup for Tests

Tests use separate test databases to avoid affecting your data.

## 🐍 Python Tests

### Installation

```bash
# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install test dependencies
pip install pytest pytest-cov pytest-mongodb
```

### Running Python Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_data_generation.py

# Run specific test function
pytest tests/test_data_generation.py::test_generate_users

# Run with coverage report
pytest --cov=python --cov-report=html

# Run tests matching a pattern
pytest -k "user"

# Run with print statements visible
pytest -s

# Run in parallel (faster)
pip install pytest-xdist
pytest -n auto
```

### Python Test Structure

```
tests/
├── test_data_generation.py    # Unit tests for generators
├── test_integration.py         # MongoDB integration tests
├── test_validation.py          # Data validation tests
└── conftest.py                # Pytest configuration
```

## 🟨 JavaScript Tests

### Installation with Yarn

```bash
# Install all dependencies including dev dependencies
yarn install

# Or if you need to add test dependencies separately
yarn add --dev jest @jest/globals
```

### Running JavaScript Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (re-runs on file changes)
yarn test:watch

# Run with coverage report
yarn test:coverage

# Run specific test file
yarn test tests/test_data_generation.test.js

# Run tests matching a pattern
yarn test --testNamePattern="User Generation"

# Run with verbose output
yarn test --verbose

# Update snapshots (if using snapshot testing)
yarn test -u

# Run in band (sequentially, useful for debugging)
yarn test --runInBand
```

### JavaScript Test Commands in package.json

```json
{
  "scripts": {
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
    "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage",
    "test:verbose": "NODE_OPTIONS=--experimental-vm-modules jest --verbose",
    "test:integration": "NODE_OPTIONS=--experimental-vm-modules jest integration.test.js",
    "test:unit": "NODE_OPTIONS=--experimental-vm-modules jest test_data_generation.test.js"
  }
}
```

## 📊 Coverage Reports

### Python Coverage

```bash
# Generate HTML coverage report
pytest --cov=python --cov-report=html

# View coverage in terminal
pytest --cov=python --cov-report=term

# Generate XML report (for CI/CD)
pytest --cov=python --cov-report=xml
```

Coverage report will be in `htmlcov/index.html`

### JavaScript Coverage

```bash
# Generate coverage report
yarn test:coverage

# Coverage report location
# Terminal output + coverage/lcov-report/index.html
```

## 🧪 Test Categories

### Unit Tests

Test individual functions in isolation:

- Data generation functions
- Validation logic
- Utility functions ```bash

#### Python

```bash
pytest tests/test_data_generation.py -v
```
#### JavaScript

```bash
yarn test test_data_generation.test.js
```


### Integration Tests

Test interaction with MongoDB:
- Database connections
- Index creation
- Query performance
- Aggregations

```bash
# Python
pytest tests/test_integration.py -v

# JavaScript
yarn test integration.test.js
````

## 🔧 Continuous Testing

### Watch Mode (JavaScript)

```bash
# Automatically re-run tests when files change
yarn test:watch
```

### Python Watch Mode

```bash
# Install pytest-watch
pip install pytest-watch

# Run in watch mode
ptw
```

## 🐛 Debugging Tests

### Python Debugging

```bash
# Drop into debugger on failure
pytest --pdb

# Drop into debugger on first failure
pytest -x --pdb

# Show local variables on failure
pytest -l
```

### JavaScript Debugging

```bash
# Run specific test with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Add console.logs (visible with --verbose)
yarn test --verbose

# Use VS Code debugger with this launch.json:
```

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 📈 Performance Testing

### Load Test Data Generation

```bash
# Python - test with larger datasets
pytest tests/test_performance.py -v

# JavaScript - increase test timeout
yarn test --testTimeout=30000
```

## ⚠️ Common Issues and Solutions

### Issue: MongoDB Connection Failed

```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list  # macOS

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Issue: Jest ES Modules Error

Ensure `package.json` has:

```json
{
  "type": "module"
}
```

And use `NODE_OPTIONS=--experimental-vm-modules` when running tests.

### Issue: Python Import Errors

```bash
# Add project root to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:${PWD}"

# Or in the test file
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
```

### Issue: Timeout Errors

```bash
# Increase timeout for slow tests
# Python
pytest --timeout=300

# JavaScript
yarn test --testTimeout=30000
```

## 🎯 Test Best Practices

1. **Isolation**: Each test should be independent
2. **Clean State**: Always clean up test data
3. **Descriptive Names**: Use clear test descriptions
4. **Small Tests**: Test one thing at a time
5. **Fast Tests**: Mock external dependencies when possible

## 📝 Writing New Tests

### Python Test Template

```python
import pytest
from python.generate_fake_data import your_function

def test_your_function_description():
    # Arrange
    input_data = {...}

    # Act
    result = your_function(input_data)

    # Assert
    assert result is not None
    assert result['key'] == expected_value
```

### JavaScript Test Template

```javascript
import { describe, test, expect } from '@jest/globals';
import { yourFunction } from '../src/your-module.js';

describe('Your Module', () => {
    test('should do something specific', () => {
        // Arrange
        const input = {...};

        // Act
        const result = yourFunction(input);

        // Assert
        expect(result).toBeDefined();
        expect(result.key).toBe(expectedValue);
    });
});
```

## 🚀 Quick Start

```bash
# setup
cd mongodb-faker-generator

# Python tests
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install pytest pytest-cov
pytest

# JavaScript tests (with Yarn)
yarn install
yarn test

# Run everything
make test  # If you have the Makefile
```

## 📊 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017

    steps:
    - uses: actions/checkout@v2

    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9

    - name: Setup Node
      uses: actions/setup-node@v2
      with:
        node-version: 16

    - name: Python Tests
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov
        pytest --cov=python --cov-report=xml

    - name: JavaScript Tests
      run: |
        yarn install
        yarn test:coverage
```
