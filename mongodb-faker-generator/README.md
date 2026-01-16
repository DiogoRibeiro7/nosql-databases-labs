# MongoDB Fake Data Generator

A comprehensive data generation toolkit for MongoDB using Faker libraries in both Python and JavaScript. Perfect for testing, teaching, and development environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [MongoDB Setup](#mongodb-setup)
- [Usage](#usage)
- [Data Models](#data-models)
- [Example Queries](#example-queries)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project provides scripts to generate realistic fake data and populate MongoDB databases. It includes implementations in both Python and JavaScript, making it suitable for various development environments and teaching scenarios.

### Use Cases

- **Development**: Populate test databases with realistic data
- **Teaching**: Create datasets for database courses without privacy concerns
- **Testing**: Load testing and performance optimization
- **Demos**: Quick database population for presentations and prototypes

## ✨ Features

- 🌍 **Multilingual Support**: Default Portuguese locale with easy language switching
- 📊 **Multiple Collections**: Users, Products, Transactions, and Logs
- 🔗 **Relational Data**: Properly linked documents across collections
- 🗺️ **Geospatial Data**: Location coordinates with 2dsphere indexing
- 🔍 **Full-Text Search**: Text indexes on searchable fields
- ⏰ **TTL Collections**: Auto-expiring logs after 30 days
- 📈 **Performance Optimized**: Proper indexes for common queries
- 🔄 **Bulk Operations**: Efficient batch inserts
- 📝 **Example Queries**: Pre-built aggregations and searches

## 📦 Prerequisites

### General Requirements

- MongoDB 4.0 or higher
- Node.js 14+ (for JavaScript version)
- Python 3.7+ (for Python version)
- 2GB+ free disk space
- Basic command line knowledge

### Optional

- Docker & Docker Compose (for containerized MongoDB)
- MongoDB Compass or Studio 3T (for GUI database management)

## 🚀 Installation

### Python Setup

```bash
# Clone the repository
git clone <repository-url>
cd mongodb-faker-data

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install faker pymongo
```

### JavaScript Setup

```bash
# Clone the repository
git clone <repository-url>
cd mongodb-faker-data

# Install dependencies
npm install @faker-js/faker mongodb

# Or using yarn
yarn add @faker-js/faker mongodb
```

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB Installation

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS with Homebrew
brew install mongodb-community

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Option 2: Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb_faker
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: mysense_demo
    volumes:
      - mongodb_data:/data/db

  mongo-express:
    image: mongo-express:latest
    container_name: mongo_express
    restart: always
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password123
      ME_CONFIG_MONGODB_URL: mongodb://admin:password123@mongodb:27017/

volumes:
  mongodb_data:
```

Start the containers:

```bash
docker-compose up -d
```

Access:

- MongoDB: `localhost:27017`
- Mongo Express (Web UI): `http://localhost:8081`

### Option 3: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com](https://www.mongodb.com)
2. Create a cluster
3. Get your connection string
4. Update the connection string in the scripts

## 💻 Usage

### Python Version

```bash
# Run with default settings
python generate_mongodb_data.py

# The script will:
# 1\. Connect to MongoDB (localhost:27017)
# 2\. Create database 'mysense_demo'
# 3\. Generate and insert:
#    - 100 users
#    - 500 products
#    - 1000 transactions
#    - 5000 logs
# 4\. Create indexes
# 5\. Run example queries
```

### JavaScript Version

```bash
# Run with Node.js
node generate_mongodb_data.js

# Or if using ES6 modules, ensure package.json has "type": "module"
# Then run:
node generate_mongodb_data.mjs
```

### Custom Connection String

Modify the connection string in either script:

```python
# Python
client = MongoClient('mongodb://username:password@host:port/')
```

```javascript
// JavaScript
const uri = "mongodb://username:password@host:port/";
```

## 📊 Data Models

### Users Collection

```json
{
  "_id": "uuid",
  "username": "string",
  "email": "string",
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "avatar": "url",
    "bio": "text",
    "birthDate": "date",
    "gender": "M|F|Other|null",
    "phone": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "postalCode": "string",
      "coordinates": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      }
    }
  },
  "account": {
    "type": "free|premium|enterprise",
    "status": "active|inactive|suspended",
    "createdAt": "datetime",
    "lastLogin": "datetime",
    "loginCount": "number",
    "preferences": {
      "newsletter": "boolean",
      "notifications": "boolean",
      "language": "pt|en|es",
      "theme": "light|dark|auto"
    }
  },
  "tags": ["array", "of", "strings"],
  "metadata": {
    "source": "web|mobile|api",
    "ipAddress": "string",
    "userAgent": "string"
  }
}
```

### Products Collection

```json
{
  "sku": "string",
  "name": "string",
  "description": "text",
  "category": "string",
  "subcategory": "string",
  "brand": "string",
  "price": {
    "amount": "number",
    "currency": "EUR",
    "discount": "number"
  },
  "inventory": {
    "inStock": "boolean",
    "quantity": "number",
    "warehouse": "Porto|Lisboa|Faro"
  },
  "attributes": {
    "color": "string|null",
    "size": "S|M|L|XL|null",
    "weight": "string",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number",
      "unit": "cm"
    }
  },
  "ratings": {
    "average": "number",
    "count": "number"
  },
  "images": ["array", "of", "urls"],
  "tags": ["array", "of", "strings"],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Transactions Collection

```json
{
  "orderId": "uuid",
  "userId": "user_id_reference",
  "status": "pending|processing|shipped|delivered|cancelled",
  "items": [
    {
      "productSku": "string",
      "productName": "string",
      "quantity": "number",
      "unitPrice": "number",
      "total": "number"
    }
  ],
  "payment": {
    "method": "credit_card|debit_card|paypal|mbway|bank_transfer",
    "status": "pending|completed|failed",
    "transactionId": "string"
  },
  "shipping": {
    "address": {
      "street": "string",
      "city": "string",
      "postalCode": "string",
      "country": "string"
    },
    "method": "standard|express|overnight",
    "trackingNumber": "string|null",
    "estimatedDelivery": "date"
  },
  "totals": {
    "subtotal": "number",
    "tax": "number",
    "shipping": "number",
    "total": "number"
  },
  "timestamps": {
    "created": "datetime",
    "updated": "datetime"
  }
}
```

### Logs Collection (with TTL)

```json
{
  "timestamp": "datetime",
  "level": "DEBUG|INFO|WARNING|ERROR|CRITICAL",
  "type": "login|logout|page_view|api_call|error|performance",
  "userId": "user_id_reference|null",
  "sessionId": "uuid",
  "message": "string",
  "metadata": {
    "ip": "string",
    "userAgent": "string",
    "endpoint": "string",
    "method": "GET|POST|PUT|DELETE",
    "statusCode": "number",
    "responseTime": "number"
  },
  "error": {
    "type": "string|null",
    "stack": "text|null"
  }
}
```

## 🔍 Example Queries

Both scripts include example queries that demonstrate:

### Basic Queries

```javascript
// Find premium users from Porto
db.users.find({
  "account.type": "premium",
  "profile.address.city": "Porto",
});

// High-rated products
db.products.find({
  "ratings.average": { $gte: 4.5 },
});
```

### Aggregation Pipeline

```javascript
// Sales by category
db.transactions.aggregate([
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.productSku",
      foreignField: "sku",
      as: "product",
    },
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: "$product.category",
      totalSales: { $sum: "$items.total" },
      count: { $sum: 1 },
    },
  },
  { $sort: { totalSales: -1 } },
]);
```

### Geospatial Query

```javascript
// Find users within 50km of Porto
db.users.find({
  "profile.address.coordinates": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-8.611, 41.1496], // Porto coordinates
      },
      $maxDistance: 50000, // 50km in meters
    },
  },
});
```

### Text Search

```javascript
// Search products by text
db.products.find({
  $text: { $search: "electronics laptop" },
});
```

## 🎨 Customization

### Changing Data Volume

```python
# Python - modify function calls
users = generate_users(200)  # Generate 200 users
products = generate_products(1000)  # Generate 1000 products
```

```javascript
// JavaScript - modify function calls
const users = generateUsers(200); // Generate 200 users
const products = generateProducts(1000); // Generate 1000 products
```

### Changing Locale

```python
# Python
fake = Faker('en_US')  # US English
fake = Faker('es_ES')  # Spanish
fake = Faker('fr_FR')  # French
```

```javascript
// JavaScript
faker.locale = "en_US"; // US English
faker.locale = "es_ES"; // Spanish
faker.locale = "fr_FR"; // French
```

### Adding Custom Fields

```python
# Python - add to generation functions
user['customField'] = fake.random_element(['A', 'B', 'C'])
user['score'] = fake.random_int(0, 100)
```

```javascript
// JavaScript - add to generation functions
user.customField = faker.helpers.arrayElement(["A", "B", "C"]);
user.score = faker.number.int({ min: 0, max: 100 });
```

## 🐛 Troubleshooting

### Connection Refused

```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list  # macOS

# Check if port 27017 is available
netstat -an | grep 27017
```

### Authentication Failed

```python
# Update connection string with credentials
client = MongoClient('mongodb://admin:password123@localhost:27017/')
```

### Memory Issues

For large datasets, insert in batches:

```python
# Python
batch_size = 1000
for i in range(0, len(data), batch_size):
    collection.insert_many(data[i:i+batch_size])
```

### Duplicate Key Errors

The scripts drop existing collections before inserting. If you want to append:

```python
# Remove these lines
collection.drop()

# Add duplicate handling
try:
    collection.insert_many(data, ordered=False)
except BulkWriteError as e:
    print(f"Inserted {e.details['nInserted']} documents")
```

Happy data generating! 🚀
