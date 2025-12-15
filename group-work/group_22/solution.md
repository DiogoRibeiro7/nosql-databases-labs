# MongoDB Database Operations - Group 22 Solution

## Database Setup

### Create Database
```javascript
use group_22_db
```

## Collection Schemas

### 1. Users Collection
```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "createdAt"],
      properties: {
        username: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "must be a valid email"
        },
        age: {
          bsonType: "int",
          minimum: 18,
          maximum: 120
        },
        address: {
          bsonType: "object",
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            country: { bsonType: "string" },
            zipCode: { bsonType: "string" }
          }
        },
        interests: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
})
```

### 2. Products Collection
```javascript
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price", "category"],
      properties: {
        name: { bsonType: "string" },
        price: { bsonType: "double", minimum: 0 },
        category: { bsonType: "string" },
        stock: { bsonType: "int", minimum: 0 },
        tags: { bsonType: "array" }
      }
    }
  }
})
```

### 3. Orders Collection
```javascript
db.createCollection("orders")
```

## Data Insertion Operations

### Insert Sample Users
```javascript
db.users.insertMany([
  {
    username: "john_doe",
    email: "john@example.com",
    age: 28,
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA",
      zipCode: "10001"
    },
    interests: ["technology", "sports", "music"],
    createdAt: new Date("2024-01-15")
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    age: 32,
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      country: "USA",
      zipCode: "90001"
    },
    interests: ["books", "travel", "cooking"],
    createdAt: new Date("2024-02-20")
  },
  {
    username: "bob_johnson",
    email: "bob@example.com",
    age: 45,
    address: {
      street: "789 Pine Rd",
      city: "Chicago",
      country: "USA",
      zipCode: "60601"
    },
    interests: ["photography", "hiking", "technology"],
    createdAt: new Date("2024-03-10")
  }
])
```

### Insert Sample Products
```javascript
db.products.insertMany([
  {
    name: "Laptop Pro",
    price: 1299.99,
    category: "Electronics",
    stock: 50,
    tags: ["computers", "portable", "high-performance"],
    specifications: {
      processor: "Intel i7",
      ram: "16GB",
      storage: "512GB SSD"
    }
  },
  {
    name: "Wireless Mouse",
    price: 29.99,
    category: "Electronics",
    stock: 200,
    tags: ["accessories", "wireless", "ergonomic"]
  },
  {
    name: "Standing Desk",
    price: 499.99,
    category: "Furniture",
    stock: 30,
    tags: ["office", "ergonomic", "adjustable"],
    dimensions: {
      width: 120,
      depth: 60,
      minHeight: 70,
      maxHeight: 120
    }
  },
  {
    name: "Coffee Maker",
    price: 79.99,
    category: "Appliances",
    stock: 75,
    tags: ["kitchen", "coffee", "automatic"]
  },
  {
    name: "Smartphone X",
    price: 999.99,
    category: "Electronics",
    stock: 100,
    tags: ["mobile", "5G", "camera"]
  }
])
```

### Insert Sample Orders
```javascript
db.orders.insertMany([
  {
    orderNumber: "ORD001",
    userId: db.users.findOne({username: "john_doe"})._id,
    items: [
      { productId: db.products.findOne({name: "Laptop Pro"})._id, quantity: 1, price: 1299.99 },
      { productId: db.products.findOne({name: "Wireless Mouse"})._id, quantity: 2, price: 29.99 }
    ],
    total: 1359.97,
    status: "delivered",
    orderDate: new Date("2024-04-01"),
    deliveryDate: new Date("2024-04-05")
  },
  {
    orderNumber: "ORD002",
    userId: db.users.findOne({username: "jane_smith"})._id,
    items: [
      { productId: db.products.findOne({name: "Standing Desk"})._id, quantity: 1, price: 499.99 },
      { productId: db.products.findOne({name: "Coffee Maker"})._id, quantity: 1, price: 79.99 }
    ],
    total: 579.98,
    status: "processing",
    orderDate: new Date("2024-04-10")
  },
  {
    orderNumber: "ORD003",
    userId: db.users.findOne({username: "bob_johnson"})._id,
    items: [
      { productId: db.products.findOne({name: "Smartphone X"})._id, quantity: 1, price: 999.99 }
    ],
    total: 999.99,
    status: "pending",
    orderDate: new Date("2024-04-15")
  }
])
```

## Query Operations

### 1. Basic Find Queries

#### Find all users from a specific city
```javascript
db.users.find({ "address.city": "New York" })
```

#### Find products within a price range
```javascript
db.products.find({
  price: { $gte: 50, $lte: 500 }
})
```

#### Find users with specific interests
```javascript
db.users.find({
  interests: { $in: ["technology", "sports"] }
})
```

### 2. Advanced Find Queries

#### Find products with complex conditions
```javascript
db.products.find({
  $and: [
    { category: "Electronics" },
    { price: { $lt: 1000 } },
    { stock: { $gte: 50 } }
  ]
})
```

#### Find orders with specific status and date range
```javascript
db.orders.find({
  status: { $in: ["processing", "delivered"] },
  orderDate: {
    $gte: new Date("2024-04-01"),
    $lte: new Date("2024-04-30")
  }
})
```

### 3. Projection Queries

#### Get user names and emails only
```javascript
db.users.find(
  {},
  { username: 1, email: 1, _id: 0 }
)
```

#### Get product names and prices, sorted by price
```javascript
db.products.find(
  { category: "Electronics" },
  { name: 1, price: 1, stock: 1 }
).sort({ price: -1 })
```

## Aggregation Pipelines

### 1. Sales Analysis by Status
```javascript
db.orders.aggregate([
  {
    $group: {
      _id: "$status",
      totalOrders: { $sum: 1 },
      totalRevenue: { $sum: "$total" },
      avgOrderValue: { $avg: "$total" }
    }
  },
  {
    $sort: { totalRevenue: -1 }
  }
])
```

### 2. Product Sales Report
```javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      totalQuantity: { $sum: "$items.quantity" },
      totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "productInfo"
    }
  },
  { $unwind: "$productInfo" },
  {
    $project: {
      productName: "$productInfo.name",
      category: "$productInfo.category",
      totalQuantity: 1,
      totalRevenue: 1
    }
  },
  { $sort: { totalRevenue: -1 } }
])
```

### 3. User Order Summary
```javascript
db.orders.aggregate([
  {
    $group: {
      _id: "$userId",
      orderCount: { $sum: 1 },
      totalSpent: { $sum: "$total" },
      lastOrderDate: { $max: "$orderDate" }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "userInfo"
    }
  },
  { $unwind: "$userInfo" },
  {
    $project: {
      username: "$userInfo.username",
      email: "$userInfo.email",
      orderCount: 1,
      totalSpent: 1,
      lastOrderDate: 1,
      avgOrderValue: { $divide: ["$totalSpent", "$orderCount"] }
    }
  },
  { $sort: { totalSpent: -1 } }
])
```

### 4. Category Performance Analysis
```javascript
db.products.aggregate([
  {
    $group: {
      _id: "$category",
      productCount: { $sum: 1 },
      avgPrice: { $avg: "$price" },
      totalStock: { $sum: "$stock" },
      minPrice: { $min: "$price" },
      maxPrice: { $max: "$price" }
    }
  },
  {
    $project: {
      category: "$_id",
      productCount: 1,
      avgPrice: { $round: ["$avgPrice", 2] },
      totalStock: 1,
      priceRange: {
        min: "$minPrice",
        max: "$maxPrice"
      }
    }
  },
  { $sort: { productCount: -1 } }
])
```

## Update Operations

### 1. Update User Information
```javascript
db.users.updateOne(
  { username: "john_doe" },
  {
    $set: {
      "address.city": "Boston",
      lastModified: new Date()
    },
    $push: {
      interests: "gaming"
    }
  }
)
```

### 2. Bulk Update Product Prices
```javascript
db.products.updateMany(
  { category: "Electronics" },
  {
    $mul: { price: 0.9 },  // 10% discount
    $set: { onSale: true, saleEndDate: new Date("2024-05-01") }
  }
)
```

### 3. Update Order Status
```javascript
db.orders.updateMany(
  {
    status: "processing",
    orderDate: { $lt: new Date("2024-04-10") }
  },
  {
    $set: {
      status: "shipped",
      shippedDate: new Date()
    }
  }
)
```

## Delete Operations

### 1. Remove Inactive Users
```javascript
db.users.deleteMany({
  createdAt: { $lt: new Date("2023-01-01") },
  lastLogin: { $exists: false }
})
```

### 2. Remove Out of Stock Products
```javascript
db.products.deleteMany({
  stock: 0,
  lastRestocked: { $lt: new Date("2024-01-01") }
})
```

## Index Creation

### 1. User Indexes
```javascript
// Unique index on email
db.users.createIndex({ email: 1 }, { unique: true })

// Compound index for location queries
db.users.createIndex({ "address.country": 1, "address.city": 1 })

// Index for interest searches
db.users.createIndex({ interests: 1 })
```

### 2. Product Indexes
```javascript
// Index for category and price queries
db.products.createIndex({ category: 1, price: -1 })

// Text index for product search
db.products.createIndex({ name: "text", tags: "text" })

// Index for stock queries
db.products.createIndex({ stock: 1 })
```

### 3. Order Indexes
```javascript
// Index for order status and date
db.orders.createIndex({ status: 1, orderDate: -1 })

// Index for user order lookup
db.orders.createIndex({ userId: 1, orderDate: -1 })

// Index for order number (unique)
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
```

## Advanced Queries

### 1. Text Search
```javascript
db.products.find({
  $text: { $search: "laptop wireless" }
})
```

### 2. Array Element Matching
```javascript
db.users.find({
  interests: {
    $elemMatch: { $eq: "technology" }
  }
})
```

### 3. Regex Pattern Matching
```javascript
db.users.find({
  email: { $regex: /.*@example.com$/, $options: "i" }
})
```

## Performance Analysis

### Explain Query Execution
```javascript
db.products.find({ category: "Electronics", price: { $lt: 500 } }).explain("executionStats")
```

### Check Index Usage
```javascript
db.users.getIndexes()
```

### Collection Statistics
```javascript
db.products.stats()
```

## Data Validation Queries

### Check for Duplicate Emails
```javascript
db.users.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

### Find Invalid Data
```javascript
db.products.find({
  $or: [
    { price: { $lte: 0 } },
    { stock: { $lt: 0 } },
    { category: { $exists: false } }
  ]
})
```

## Summary

This solution demonstrates comprehensive MongoDB database operations including:
- Schema design and validation
- Data insertion strategies
- Simple and complex queries
- Aggregation pipelines for analytics
- Update operations for data maintenance
- Index creation for performance optimization
- Data validation and integrity checks

All operations are designed to work directly with MongoDB through the shell or drivers, focusing purely on database interactions without any API layer.
