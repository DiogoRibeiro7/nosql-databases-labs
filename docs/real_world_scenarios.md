# 🌍 Real-World MongoDB Scenarios

This document maps lab exercises to actual business use cases, helping you understand how MongoDB concepts apply in production environments.

## 🛒 E-Commerce Platform

### Business Context
An online marketplace serving 10M+ users with 100K+ products, processing thousands of orders daily.

### MongoDB Solutions

#### Product Catalog (Lab 02: Data Modeling)
```javascript
// Product document with embedded reviews summary
{
  "_id": ObjectId("..."),
  "sku": "LAPTOP-001",
  "name": "Pro Laptop 15",
  "category": ["Electronics", "Computers", "Laptops"],
  "price": {
    "current": 1299.99,
    "original": 1499.99,
    "currency": "USD"
  },
  "inventory": {
    "available": 45,
    "reserved": 5,
    "warehouse": {
      "NYC": 20,
      "LA": 15,
      "CHI": 10
    }
  },
  "attributes": {  // Flexible schema for different products
    "brand": "TechBrand",
    "processor": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  },
  "reviews": {  // Embedded summary, full reviews referenced
    "average": 4.5,
    "count": 234,
    "distribution": {
      "5": 150,
      "4": 60,
      "3": 20,
      "2": 3,
      "1": 1
    }
  }
}
```

**Lab Skills Applied:**
- Flexible schema for product variants
- Embedded vs referenced data (reviews)
- Denormalization for performance

#### Shopping Cart (Lab 01: CRUD Operations)
```javascript
// Shopping cart with automatic expiry
{
  "_id": ObjectId("..."),
  "sessionId": "sess_abc123",
  "userId": ObjectId("..."),  // null for guest
  "items": [
    {
      "productId": ObjectId("..."),
      "sku": "LAPTOP-001",
      "name": "Pro Laptop 15",
      "price": 1299.99,
      "quantity": 1,
      "addedAt": ISODate("2024-01-15T10:30:00Z")
    }
  ],
  "subtotal": 1299.99,
  "lastModified": ISODate("2024-01-15T10:30:00Z"),
  "expiresAt": ISODate("2024-01-15T11:30:00Z")  // TTL index
}

// TTL index for cart cleanup
db.carts.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

#### Order Analytics (Lab 04: Aggregation)
```javascript
// Daily sales report aggregation
db.orders.aggregate([
  {
    $match: {
      orderDate: {
        $gte: ISODate("2024-01-01"),
        $lt: ISODate("2024-02-01")
      }
    }
  },
  {
    $group: {
      _id: {
        day: { $dayOfMonth: "$orderDate" },
        category: "$items.category"
      },
      revenue: { $sum: "$total" },
      orders: { $sum: 1 },
      units: { $sum: { $sum: "$items.quantity" } }
    }
  },
  {
    $sort: { "_id.day": 1 }
  },
  {
    $merge: {
      into: "sales_reports",
      whenMatched: "replace"
    }
  }
])
```

#### Real-time Inventory (Modern Features: Change Streams)
```javascript
// Monitor inventory changes for low stock alerts
const pipeline = [
  {
    $match: {
      $and: [
        { "fullDocument.inventory.available": { $lt: 10 } },
        { operationType: { $in: ["update", "replace"] } }
      ]
    }
  }
];

const changeStream = db.products.watch(pipeline);
changeStream.on("change", (change) => {
  // Send alert to inventory team
  sendLowStockAlert(change.fullDocument);
});
```

---

## 🏥 Healthcare Management System

### Business Context
Hospital network managing patient records, appointments, and medical history across multiple facilities.

### MongoDB Solutions

#### Patient Records (Lab 02: Data Modeling)
```javascript
// Patient document with medical history
{
  "_id": ObjectId("..."),
  "patientId": "PAT-2024-001",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "dob": ISODate("1980-05-15"),
    "ssn": { "$encrypt": "..." }  // Client-side field encryption
  },
  "contact": {
    "phone": "+1-555-0100",
    "email": "john.doe@email.com",
    "address": {
      "street": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zip": "02101"
    }
  },
  "medicalHistory": {
    "allergies": ["penicillin", "shellfish"],
    "conditions": ["diabetes_type2", "hypertension"],
    "medications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "startDate": ISODate("2023-01-15")
      }
    ]
  },
  "recentVisits": [  // Last 5 visits embedded
    {
      "visitId": ObjectId("..."),
      "date": ISODate("2024-01-10"),
      "reason": "Regular checkup",
      "provider": "Dr. Smith"
    }
  ]
}
```

#### Appointment Scheduling (Lab 03: Queries & Indexes)
```javascript
// Find available appointment slots
db.appointments.find({
  "providerId": ObjectId("..."),
  "date": {
    $gte: ISODate("2024-01-15"),
    $lt: ISODate("2024-01-16")
  },
  "status": "available"
}).sort({ "time": 1 })

// Compound index for efficient scheduling queries
db.appointments.createIndex({
  "providerId": 1,
  "date": 1,
  "status": 1,
  "time": 1
})
```

#### Medical Analytics (Lab 04: Aggregation)
```javascript
// Analyze treatment outcomes by condition
db.treatments.aggregate([
  {
    $match: {
      condition: "diabetes_type2",
      completedDate: { $exists: true }
    }
  },
  {
    $lookup: {
      from: "outcomes",
      localField: "_id",
      foreignField: "treatmentId",
      as: "outcome"
    }
  },
  {
    $unwind: "$outcome"
  },
  {
    $group: {
      _id: "$medication",
      totalPatients: { $sum: 1 },
      improved: {
        $sum: { $cond: [{ $eq: ["$outcome.result", "improved"] }, 1, 0] }
      },
      successRate: {
        $avg: { $cond: [{ $eq: ["$outcome.result", "improved"] }, 1, 0] }
      }
    }
  },
  {
    $sort: { successRate: -1 }
  }
])
```

---

## 🎮 Gaming Platform

### Business Context
Multiplayer gaming platform with millions of users, real-time leaderboards, and in-game transactions.

### MongoDB Solutions

#### Player Profiles (Lab 02: Data Modeling)
```javascript
// Player document with embedded stats
{
  "_id": ObjectId("..."),
  "username": "ProGamer123",
  "account": {
    "email": "gamer@email.com",
    "created": ISODate("2023-01-15"),
    "lastLogin": ISODate("2024-01-15T14:30:00Z"),
    "subscription": "premium"
  },
  "stats": {
    "gamesPlayed": 1520,
    "wins": 890,
    "losses": 630,
    "winRate": 0.585,
    "currentStreak": 5,
    "ranking": {
      "global": 15420,
      "regional": 520,
      "tier": "Diamond"
    }
  },
  "achievements": [
    {
      "id": "first_win",
      "unlockedAt": ISODate("2023-01-16"),
      "rarity": 0.95  // 95% of players have this
    }
  ],
  "recentMatches": [  // Last 10 matches
    {
      "matchId": ObjectId("..."),
      "result": "win",
      "score": 2500,
      "duration": 1200
    }
  ]
}
```

#### Real-time Leaderboards (Modern Features: Change Streams)
```javascript
// Update leaderboard in real-time
const leaderboardStream = db.players.watch([
  {
    $match: {
      "updateDescription.updatedFields.stats.ranking.global": { $exists: true }
    }
  }
]);

leaderboardStream.on("change", async (change) => {
  // Update cached leaderboard
  await updateLeaderboardCache(change.fullDocument);
  // Notify connected clients via WebSocket
  broadcastLeaderboardUpdate(change.fullDocument);
});
```

#### Match Making (Lab 03: Queries)
```javascript
// Find suitable opponents
db.players.find({
  "stats.ranking.tier": playerTier,
  "stats.ranking.global": {
    $gte: playerRank - 500,
    $lte: playerRank + 500
  },
  "status": "online",
  "_id": { $ne: playerId }
}).limit(10)

// Geospatial query for nearby players (lower latency)
db.players.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [userLng, userLat] },
      $maxDistance: 1000000  // 1000km
    }
  },
  "stats.ranking.tier": playerTier
})
```

---

## 📱 Social Media Platform

### Business Context
Social platform with user-generated content, real-time feeds, and complex relationships.

### MongoDB Solutions

#### User Profiles & Relationships (Lab 02: Data Modeling)
```javascript
// User with follower/following counts (not arrays!)
{
  "_id": ObjectId("..."),
  "username": "tech_blogger",
  "profile": {
    "name": "Tech Blogger",
    "bio": "Writing about MongoDB and cloud tech",
    "avatar": "https://...",
    "verified": true
  },
  "stats": {
    "followers": 15234,  // Counter, not array
    "following": 523,
    "posts": 892,
    "engagement": 0.045  // Pre-calculated metric
  },
  "settings": {
    "privacy": "public",
    "notifications": {
      "mentions": true,
      "likes": false,
      "follows": true
    }
  }
}

// Separate collection for relationships
{
  "_id": ObjectId("..."),
  "follower": ObjectId("..."),
  "following": ObjectId("..."),
  "followDate": ISODate("2024-01-15"),
  "mutual": false
}
```

#### Content Feed Generation (Lab 04: Aggregation)
```javascript
// Generate personalized feed
db.posts.aggregate([
  // Get posts from followed users
  {
    $lookup: {
      from: "relationships",
      let: { userId: ObjectId(currentUserId) },
      pipeline: [
        { $match: { follower: "$$userId" } },
        { $project: { following: 1 } }
      ],
      as: "followedUsers"
    }
  },
  {
    $match: {
      $or: [
        { userId: { $in: "$followedUsers.following" } },
        { boosted: true },  // Promoted content
        { trending: true }   // Viral content
      ]
    }
  },
  // Calculate relevance score
  {
    $addFields: {
      relevanceScore: {
        $add: [
          { $multiply: ["$likes", 0.3] },
          { $multiply: ["$comments", 0.5] },
          { $multiply: ["$shares", 0.2] },
          { $cond: [{ $eq: ["$boosted", true] }, 1000, 0] }
        ]
      }
    }
  },
  { $sort: { relevanceScore: -1, createdAt: -1 } },
  { $limit: 50 }
])
```

#### Trending Topics (Modern Features: Time-Series)
```javascript
// Time-series collection for hashtag tracking
db.createCollection("hashtag_metrics", {
  timeseries: {
    timeField: "timestamp",
    metaField: "hashtag",
    granularity: "minutes"
  }
})

// Analyze trending hashtags
db.hashtag_metrics.aggregate([
  {
    $match: {
      timestamp: { $gte: new Date(Date.now() - 3600000) }  // Last hour
    }
  },
  {
    $group: {
      _id: "$hashtag",
      count: { $sum: "$count" },
      velocity: { $avg: "$velocity" }  // Rate of increase
    }
  },
  {
    $sort: { velocity: -1, count: -1 }
  },
  { $limit: 10 }
])
```

---

## 🏦 Financial Services

### Business Context
Banking application handling transactions, account management, and fraud detection.

### MongoDB Solutions

#### Account Management (Lab 05: Transactions)
```javascript
// Transfer money between accounts (ACID transaction)
const session = client.startSession();
session.startTransaction();

try {
  // Debit from sender
  await db.accounts.updateOne(
    { accountNumber: "ACC001", balance: { $gte: 500 } },
    { $inc: { balance: -500 } },
    { session }
  );

  // Credit to receiver
  await db.accounts.updateOne(
    { accountNumber: "ACC002" },
    { $inc: { balance: 500 } },
    { session }
  );

  // Log transaction
  await db.transactions.insertOne({
    from: "ACC001",
    to: "ACC002",
    amount: 500,
    timestamp: new Date(),
    status: "completed"
  }, { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

#### Fraud Detection (Lab 03: Queries & Modern Features)
```javascript
// Real-time fraud monitoring with change streams
const fraudStream = db.transactions.watch([
  {
    $match: {
      $or: [
        { "fullDocument.amount": { $gt: 10000 } },
        { "fullDocument.location": { $ne: "$homeLocation" } }
      ]
    }
  }
]);

// Pattern-based fraud detection
db.transactions.aggregate([
  {
    $match: {
      accountNumber: "ACC001",
      timestamp: { $gte: new Date(Date.now() - 3600000) }
    }
  },
  {
    $group: {
      _id: "$accountNumber",
      count: { $sum: 1 },
      totalAmount: { $sum: "$amount" },
      locations: { $addToSet: "$location" }
    }
  },
  {
    $match: {
      $or: [
        { count: { $gt: 10 } },  // Too many transactions
        { totalAmount: { $gt: 50000 } },  // Large volume
        { "locations.1": { $exists: true } }  // Multiple locations
      ]
    }
  }
])
```

---

## 🚚 Logistics & Supply Chain

### Business Context
Global logistics company tracking shipments, managing warehouses, and optimizing routes.

### MongoDB Solutions

#### Shipment Tracking (Modern Features: Time-Series)
```javascript
// Time-series collection for GPS tracking
db.createCollection("tracking_data", {
  timeseries: {
    timeField: "timestamp",
    metaField: "shipmentId",
    granularity: "minutes"
  }
})

// Track shipment location over time
{
  "shipmentId": "SHIP-2024-001",
  "timestamp": ISODate("2024-01-15T10:30:00Z"),
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  },
  "speed": 65,
  "temperature": 38,  // For cold chain
  "humidity": 45,
  "events": ["departed_warehouse"]
}
```

#### Route Optimization (Lab 03: Geospatial)
```javascript
// Find nearby delivery points
db.deliveries.aggregate([
  {
    $geoNear: {
      near: currentLocation,
      distanceField: "distance",
      maxDistance: 50000,  // 50km radius
      query: { status: "pending" },
      spherical: true
    }
  },
  {
    $sort: { priority: -1, distance: 1 }
  },
  {
    $limit: 20
  }
])
```

#### Warehouse Analytics (Lab 04: Aggregation)
```javascript
// Analyze warehouse efficiency
db.warehouse_operations.aggregate([
  {
    $facet: {
      "inbound": [
        { $match: { type: "receiving" } },
        { $group: {
          _id: "$warehouseId",
          avgProcessTime: { $avg: "$processingTime" },
          totalItems: { $sum: "$itemCount" }
        }}
      ],
      "outbound": [
        { $match: { type: "shipping" } },
        { $group: {
          _id: "$warehouseId",
          avgFulfillmentTime: { $avg: "$fulfillmentTime" },
          ordersProcessed: { $sum: 1 }
        }}
      ],
      "inventory": [
        { $match: { type: "inventory" } },
        { $group: {
          _id: "$warehouseId",
          turnoverRate: { $avg: "$turnover" },
          stockoutEvents: { $sum: "$stockouts" }
        }}
      ]
    }
  }
])
```

---

## 🎓 Learning Management System

### Business Context
Online education platform with courses, assessments, and student progress tracking.

### MongoDB Solutions

#### Course Structure (Lab 02: Data Modeling)
```javascript
// Course with embedded modules and lessons
{
  "_id": ObjectId("..."),
  "courseId": "CS101",
  "title": "Introduction to MongoDB",
  "instructor": {
    "id": ObjectId("..."),
    "name": "Dr. Smith",
    "rating": 4.8
  },
  "modules": [
    {
      "moduleId": 1,
      "title": "Getting Started",
      "lessons": [
        {
          "lessonId": 1,
          "title": "Installing MongoDB",
          "type": "video",
          "duration": 600,
          "resources": ["slides.pdf", "setup_guide.md"]
        }
      ],
      "quiz": {
        "quizId": ObjectId("..."),
        "questions": 10,
        "passingScore": 70
      }
    }
  ],
  "enrollment": {
    "current": 1523,
    "capacity": 2000,
    "waitlist": 45
  }
}
```

#### Student Progress Tracking (Lab 04: Aggregation)
```javascript
// Calculate student progress and performance
db.enrollments.aggregate([
  {
    $lookup: {
      from: "progress",
      localField: "_id",
      foreignField: "enrollmentId",
      as: "progress"
    }
  },
  {
    $unwind: "$progress"
  },
  {
    $group: {
      _id: "$studentId",
      coursesEnrolled: { $sum: 1 },
      avgProgress: { $avg: "$progress.percentComplete" },
      avgScore: { $avg: "$progress.currentGrade" },
      completedCourses: {
        $sum: { $cond: [{ $gte: ["$progress.percentComplete", 100] }, 1, 0] }
      }
    }
  },
  {
    $addFields: {
      completionRate: {
        $divide: ["$completedCourses", "$coursesEnrolled"]
      }
    }
  }
])
```

---

## 🏢 Implementation Best Practices

### 1. Schema Design Principles
- **Design for queries**: Structure data based on access patterns
- **Avoid unbounded growth**: Use references for large arrays
- **Denormalize thoughtfully**: Balance read performance vs data duplication

### 2. Performance Optimization
- **Index strategically**: Cover queries, avoid over-indexing
- **Use projections**: Return only needed fields
- **Leverage aggregation**: Process data in database, not application

### 3. Scalability Considerations
- **Shard early**: Plan sharding strategy before data grows
- **Use appropriate consistency**: Not all operations need strong consistency
- **Cache strategically**: Use Redis/Memcached for frequently accessed data

### 4. Security Measures
- **Enable authentication**: Always in production
- **Use field-level encryption**: For sensitive data
- **Implement RBAC**: Role-based access control
- **Audit logging**: Track all data access

---

**Key Takeaways:**
- MongoDB's flexible schema adapts to diverse business needs
- Document model reduces complexity in many real-world scenarios
- Modern features enable real-time and analytical workloads
- Proper modeling and indexing crucial for performance at scale

*These scenarios demonstrate MongoDB's versatility across industries. Each lab teaches skills directly applicable to these production use cases.*

---

*Last Updated: December 2024*