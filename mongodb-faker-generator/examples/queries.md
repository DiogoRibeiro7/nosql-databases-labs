# MongoDB Query Examples

This document contains useful MongoDB queries for the generated fake data.

## Basic Queries

### User Queries
```javascript
// Find all premium users
db.users.find({ "account.type": "premium" })

// Find users registered in the last 30 days
db.users.find({
  "account.createdAt": {
    $gte: new Date(new Date().setDate(new Date().getDate() - 30))
  }
})

// Find users by city with projection
db.users.find(
  { "profile.address.city": "Porto" },
  { username: 1, email: 1, "profile.fullName": 1 }
)

// Count active users by account type
db.users.aggregate([
  { $match: { "account.status": "active" } },
  { $group: {
    _id: "$account.type",
    count: { $sum: 1 }
  }}
])
```

### Product Queries
```javascript
// Products under €50 in stock
db.products.find({
  "price.amount": { $lt: 50 },
  "inventory.inStock": true
})

// Top rated products (4.5+ stars with 100+ reviews)
db.products.find({
  "ratings.average": { $gte: 4.5 },
  "ratings.count": { $gte: 100 }
}).sort({ "ratings.average": -1 })

// Products by category with discount
db.products.find({
  category: "Electronics",
  "price.discount": { $gt: 0 }
})

// Search products by text
db.products.find({
  $text: { $search: "laptop computer" }
})
```

### Transaction Queries
```javascript
// Today's transactions
db.transactions.find({
  "timestamps.created": {
    $gte: new Date(new Date().setHours(0, 0, 0, 0))
  }
})

// Cancelled orders over €100
db.transactions.find({
  status: "cancelled",
  "totals.total": { $gte: 100 }
})

// Transactions by payment method
db.transactions.aggregate([
  { $group: {
    _id: "$payment.method",
    count: { $sum: 1 },
    totalRevenue: { $sum: "$totals.total" }
  }},
  { $sort: { totalRevenue: -1 } }
])
```

### Log Queries
```javascript
// Recent errors
db.logs.find({ level: "ERROR" }).sort({ timestamp: -1 }).limit(10)

// API performance issues (response time > 1000ms)
db.logs.find({
  "metadata.responseTime": { $gt: 1000 }
})

// Failed login attempts
db.logs.find({
  type: "login",
  "metadata.statusCode": { $in: [401, 403] }
})
```

## Advanced Aggregations

### User Activity Report
```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "transactions",
      localField: "_id",
      foreignField: "userId",
      as: "orders"
    }
  },
  {
    $project: {
      username: 1,
      email: 1,
      accountType: "$account.type",
      totalOrders: { $size: "$orders" },
      totalSpent: { $sum: "$orders.totals.total" },
      lastLogin: "$account.lastLogin"
    }
  },
  {
    $match: {
      totalOrders: { $gt: 0 }
    }
  },
  {
    $sort: { totalSpent: -1 }
  },
  {
    $limit: 10
  }
])
```

### Sales Analytics
```javascript
db.transactions.aggregate([
  {
    $match: {
      status: { $in: ["shipped", "delivered"] }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$timestamps.created" },
        month: { $month: "$timestamps.created" }
      },
      revenue: { $sum: "$totals.total" },
      orders: { $sum: 1 },
      avgOrderValue: { $avg: "$totals.total" }
    }
  },
  {
    $sort: { "_id.year": -1, "_id.month": -1 }
  }
])
```

### Product Performance
```javascript
db.transactions.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productSku",
      productName: { $first: "$items.productName" },
      totalQuantity: { $sum: "$items.quantity" },
      totalRevenue: { $sum: "$items.total" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "sku",
      as: "productInfo"
    }
  },
  {
    $unwind: "$productInfo"
  },
  {
    $project: {
      productName: 1,
      totalQuantity: 1,
      totalRevenue: 1,
      orderCount: 1,
      category: "$productInfo.category",
      rating: "$productInfo.ratings.average"
    }
  },
  {
    $sort: { totalRevenue: -1 }
  },
  {
    $limit: 20
  }
])
```

### Geographic Distribution
```javascript
db.users.aggregate([
  {
    $group: {
      _id: "$profile.address.city",
      userCount: { $sum: 1 },
      premiumUsers: {
        $sum: {
          $cond: [{ $eq: ["$account.type", "premium"] }, 1, 0]
        }
      }
    }
  },
  {
    $sort: { userCount: -1 }
  },
  {
    $limit: 10
  }
])
```

## Geospatial Queries
```javascript
// Find users within 50km of Porto
db.users.find({
  "profile.address.coordinates": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-8.611, 41.1496]  // Porto coordinates
      },
      $maxDistance: 50000  // 50km in meters
    }
  }
})

// Users in a specific area (polygon)
db.users.find({
  "profile.address.coordinates": {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[
          [-8.7, 41.1],
          [-8.5, 41.1],
          [-8.5, 41.2],
          [-8.7, 41.2],
          [-8.7, 41.1]
        ]]
      }
    }
  }
})
```

## Index Creation
```javascript
// Performance indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "account.createdAt": -1 })
db.users.createIndex({ "profile.address.coordinates": "2dsphere" })

db.products.createIndex({ "sku": 1 }, { unique: true })
db.products.createIndex({ "category": 1, "price.amount": 1 })
db.products.createIndex({ "name": "text", "description": "text" })

db.transactions.createIndex({ "orderId": 1 }, { unique: true })
db.transactions.createIndex({ "userId": 1, "timestamps.created": -1 })
db.transactions.createIndex({ "status": 1 })

db.logs.createIndex({ "timestamp": -1 })
db.logs.createIndex({ "userId": 1, "timestamp": -1 })
db.logs.createIndex({ "level": 1 })
db.logs.createIndex(
  { "timestamp": 1 }, 
  { expireAfterSeconds: 2592000 }  // 30 days
)
```

## Useful Administrative Queries
```javascript
// Database statistics
db.stats()

// Collection sizes
db.getCollectionNames().forEach(function(collection) {
  var stats = db[collection].stats();
  print(collection + ": " + stats.count + " documents, " + 
        (stats.size / 1024 / 1024).toFixed(2) + " MB");
})

// Index usage
db.users.aggregate([
  { $indexStats: {} }
])

// Query performance analysis
db.transactions.find({
  "totals.total": { $gte: 500 }
}).explain("executionStats")
```
