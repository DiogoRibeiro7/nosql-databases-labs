#!/usr/bin/env node

/**
 * Setup sample files for group directories
 * This creates minimal README.md and solution.md files for testing
 */

const fs = require("fs");
const path = require("path");

const GROUPS_DIR = path.join(__dirname, "..", "group-work");

const sampleReadme = `# Group Project

## Team Members
- Student 1
- Student 2
- Student 3

## Project Overview
This project demonstrates our understanding of MongoDB concepts including:
- Database design and modeling
- Query optimization
- Aggregation pipelines
- Indexing strategies

## Key Features
Our solution implements:
1. Efficient data retrieval using optimized queries
2. Complex aggregation for business analytics
3. Proper indexing for performance
4. Data validation and error handling

## Technologies Used
- MongoDB 7.0
- Node.js
- MongoDB Node.js Driver

## Setup Instructions
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Configure MongoDB connection in .env
4. Run the application: \`npm start\`

## Architecture
The application follows a modular architecture with separate layers for:
- Data access (MongoDB queries)
- Business logic
- Presentation/API layer

## Testing
We have implemented comprehensive tests for:
- Query correctness
- Performance benchmarks
- Edge cases and error handling

## Challenges and Solutions
During development, we encountered and resolved:
- Performance issues with large datasets (solved using proper indexing)
- Complex aggregation requirements (implemented multi-stage pipelines)
- Data consistency challenges (used transactions where needed)

## Future Improvements
- Implement caching layer
- Add real-time data synchronization
- Enhance query performance monitoring
`;

const sampleSolution = `# MongoDB Solution Documentation

## Database Schema Design

### Collections Structure

#### users Collection
\`\`\`javascript
{
  _id: ObjectId(),
  username: String,
  email: String,
  profile: {
    firstName: String,
    lastName: String,
    age: Number
  },
  createdAt: Date,
  lastLogin: Date
}
\`\`\`

#### orders Collection
\`\`\`javascript
{
  _id: ObjectId(),
  userId: ObjectId(),
  items: [{
    productId: ObjectId(),
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String,
  orderDate: Date
}
\`\`\`

## Query Solutions

### 1. Find Active Users
\`\`\`javascript
db.users.find({
  lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
\`\`\`

### 2. Aggregate Sales by Month
\`\`\`javascript
db.orders.aggregate([
  {
    $match: { status: "completed" }
  },
  {
    $group: {
      _id: {
        year: { $year: "$orderDate" },
        month: { $month: "$orderDate" }
      },
      totalSales: { $sum: "$total" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $sort: { "_id.year": -1, "_id.month": -1 }
  }
])
\`\`\`

### 3. Find Top Customers
\`\`\`javascript
db.orders.aggregate([
  {
    $group: {
      _id: "$userId",
      totalSpent: { $sum: "$total" },
      orderCount: { $sum: 1 }
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
  {
    $unwind: "$userInfo"
  },
  {
    $project: {
      username: "$userInfo.username",
      email: "$userInfo.email",
      totalSpent: 1,
      orderCount: 1
    }
  },
  {
    $sort: { totalSpent: -1 }
  },
  {
    $limit: 10
  }
])
\`\`\`

### 4. Product Performance Analysis
\`\`\`javascript
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      unitsSold: { $sum: "$items.quantity" },
      orderCount: { $sum: 1 }
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
  {
    $sort: { totalRevenue: -1 }
  }
])
\`\`\`

### 5. Create Indexes for Performance
\`\`\`javascript
// User email index (unique)
db.users.createIndex({ email: 1 }, { unique: true })

// Order status and date compound index
db.orders.createIndex({ status: 1, orderDate: -1 })

// User ID index for order lookups
db.orders.createIndex({ userId: 1 })

// Text index for product search
db.products.createIndex({ name: "text", description: "text" })
\`\`\`

### 6. Update Operations
\`\`\`javascript
// Update user profile
db.users.updateOne(
  { _id: userId },
  {
    $set: {
      "profile.firstName": "John",
      "profile.lastName": "Doe",
      lastLogin: new Date()
    }
  }
)

// Bulk update order status
db.orders.updateMany(
  { status: "pending", orderDate: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  { $set: { status: "cancelled" } }
)
\`\`\`

### 7. Delete Operations
\`\`\`javascript
// Delete inactive users
db.users.deleteMany({
  lastLogin: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
})

// Remove cancelled orders older than 30 days
db.orders.deleteMany({
  status: "cancelled",
  orderDate: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
\`\`\`

## Performance Optimizations

1. **Indexing Strategy**: Created compound indexes for frequently used query patterns
2. **Query Optimization**: Used projection to limit returned fields
3. **Aggregation Pipeline**: Optimized pipeline stages order for better performance
4. **Connection Pooling**: Implemented connection pooling for better resource utilization

## Testing Results

All queries have been tested with sample data and perform within acceptable time limits:
- User queries: < 50ms
- Aggregation pipelines: < 200ms
- Bulk operations: < 500ms for 1000 documents
`;

// Get all group directories
const groups = fs
  .readdirSync(GROUPS_DIR)
  .filter(
    (dir) => dir.startsWith("group_") && fs.statSync(path.join(GROUPS_DIR, dir)).isDirectory()
  );

console.log(`Found ${groups.length} group directories`);

groups.forEach((group) => {
  const groupPath = path.join(GROUPS_DIR, group);
  const readmePath = path.join(groupPath, "README.md");
  const solutionPath = path.join(groupPath, "solution.md");

  // Create README if it doesn't exist
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, sampleReadme);
    console.log(`✓ Created README.md for ${group}`);
  } else {
    console.log(`  README.md already exists for ${group}`);
  }

  // Create solution.md if it doesn't exist
  if (!fs.existsSync(solutionPath)) {
    fs.writeFileSync(solutionPath, sampleSolution);
    console.log(`✓ Created solution.md for ${group}`);
  } else {
    console.log(`  solution.md already exists for ${group}`);
  }
});

console.log("\n✓ Group sample files setup complete");
