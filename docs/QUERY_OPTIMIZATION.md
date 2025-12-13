# MongoDB Query Optimization Best Practices

A comprehensive guide to optimizing MongoDB queries for better performance.

## Table of Contents

1. [Understanding Query Performance](#understanding-query-performance)
2. [Indexing Strategies](#indexing-strategies)
3. [Query Optimization Techniques](#query-optimization-techniques)
4. [Aggregation Pipeline Optimization](#aggregation-pipeline-optimization)
5. [Schema Design for Performance](#schema-design-for-performance)
6. [Monitoring and Profiling](#monitoring-and-profiling)
7. [Common Anti-Patterns](#common-anti-patterns)
8. [Performance Testing](#performance-testing)

---

## Understanding Query Performance

### Using explain()

The `explain()` method is your primary tool for understanding query performance:

```javascript
// Basic explain
db.collection.find({status: "active"}).explain()

// Detailed execution statistics
db.collection.find({status: "active"}).explain("executionStats")

// All plans considered by optimizer
db.collection.find({status: "active"}).explain("allPlansExecution")
```

### Key Metrics to Watch

```javascript
{
  "executionTimeMillis": 10,        // Total execution time
  "totalDocsExamined": 1000,        // Documents scanned
  "totalKeysExamined": 50,          // Index keys examined
  "nReturned": 50,                  // Documents returned
  "executionStages": {
    "stage": "IXSCAN",             // COLLSCAN = bad, IXSCAN = good
    "indexName": "status_1"        // Index used
  }
}
```

### Performance Rules of Thumb

- **Examine-to-Return Ratio:** `totalDocsExamined / nReturned` should be close to 1
- **Index Usage:** Stage should be `IXSCAN` not `COLLSCAN` for large collections
- **Execution Time:** Queries should complete in <100ms for interactive applications

---

## Indexing Strategies

### Types of Indexes

#### 1. Single Field Index
```javascript
// Basic single field index
db.users.createIndex({email: 1})

// Descending index
db.posts.createIndex({createdAt: -1})
```

#### 2. Compound Index
```javascript
// Order matters! Index on (status, createdAt)
db.orders.createIndex({status: 1, createdAt: -1})

// This query uses the index
db.orders.find({status: "pending"}).sort({createdAt: -1})

// This query also uses the index (prefix)
db.orders.find({status: "pending"})

// This query CANNOT use the index efficiently
db.orders.find({createdAt: {$gte: new Date("2024-01-01")}})
```

#### 3. Multikey Index (Arrays)
```javascript
// Index on array field
db.products.createIndex({tags: 1})

// Efficiently finds documents where tags array contains "electronics"
db.products.find({tags: "electronics"})
```

#### 4. Text Index
```javascript
// Create text index
db.articles.createIndex({title: "text", content: "text"})

// Text search
db.articles.find({$text: {$search: "mongodb optimization"}})

// With score
db.articles.find(
  {$text: {$search: "mongodb optimization"}},
  {score: {$meta: "textScore"}}
).sort({score: {$meta: "textScore"}})
```

#### 5. Geospatial Index
```javascript
// 2dsphere index for GeoJSON
db.locations.createIndex({coordinates: "2dsphere"})

// Find nearby locations
db.locations.find({
  coordinates: {
    $near: {
      $geometry: {type: "Point", coordinates: [-73.97, 40.77]},
      $maxDistance: 1000
    }
  }
})
```

### Index Selection Strategy

```javascript
// Analyze query patterns
db.collection.aggregate([
  {$indexStats: {}},
  {$sort: {accesses.ops: -1}}
])

// Find unused indexes
db.collection.aggregate([
  {$indexStats: {}},
  {$match: {"accesses.ops": 0}}
])
```

### Compound Index Design

**ESR Rule: Equality, Sort, Range**

```javascript
// Optimal compound index for this query:
db.products.find({
  category: "electronics",        // Equality
  status: "active",               // Equality
  price: {$gte: 100, $lte: 500}  // Range
}).sort({popularity: -1})         // Sort

// Create index following ESR rule:
db.products.createIndex({
  category: 1,     // Equality fields first
  status: 1,       // Equality fields first
  popularity: -1,  // Sort fields second
  price: 1        // Range fields last
})
```

### Index Hints

```javascript
// Force specific index usage
db.collection.find({field: value}).hint({field: 1})

// Force collection scan (for testing)
db.collection.find({field: value}).hint({$natural: 1})
```

---

## Query Optimization Techniques

### 1. Use Projection

```javascript
// Bad: Fetching entire document
db.users.find({status: "active"})

// Good: Only fetch needed fields
db.users.find(
  {status: "active"},
  {name: 1, email: 1, _id: 0}
)
```

### 2. Limit Results

```javascript
// Always use limit for queries that don't need all results
db.posts.find({author: "john"}).limit(10)

// Use skip sparingly (it's inefficient for large offsets)
db.posts.find().skip(10000).limit(10)  // Bad

// Better: Use range queries
db.posts.find({_id: {$gt: lastId}}).limit(10)  // Good
```

### 3. Covered Queries

```javascript
// Index covers all fields in query and projection
db.users.createIndex({email: 1, name: 1, status: 1})

// This query is "covered" - no document fetch needed
db.users.find(
  {email: "user@example.com"},
  {name: 1, status: 1, _id: 0}
)
```

### 4. Avoid Negation Operators

```javascript
// Bad: Negation operators often can't use indexes
db.users.find({status: {$ne: "inactive"}})
db.users.find({age: {$nin: [25, 30, 35]}})

// Good: Use positive conditions
db.users.find({status: {$in: ["active", "pending"]}})
```

### 5. Regex Optimization

```javascript
// Bad: Starts with wildcard (can't use index)
db.users.find({name: /.*john/})

// Good: Anchored regex (can use index)
db.users.find({name: /^john/})

// For case-insensitive, create a lowercase field
db.users.find({nameLower: "john"})  // With index on nameLower
```

### 6. Use $exists Carefully

```javascript
// Bad: $exists queries can be slow
db.users.find({phoneNumber: {$exists: true}})

// Good: Store a flag field
db.users.find({hasPhoneNumber: true})
```

---

## Aggregation Pipeline Optimization

### 1. Order of Stages Matters

```javascript
// Bad: Processing all documents before filtering
db.orders.aggregate([
  {$lookup: {...}},      // Expensive operation first
  {$unwind: "$items"},
  {$match: {status: "completed"}}  // Filter last
])

// Good: Filter early
db.orders.aggregate([
  {$match: {status: "completed"}},  // Filter first
  {$lookup: {...}},
  {$unwind: "$items"}
])
```

### 2. Use Indexes in Aggregation

```javascript
// $match and $sort at the beginning can use indexes
db.sales.aggregate([
  {$match: {date: {$gte: startDate}}},  // Uses index
  {$sort: {date: -1}},                  // Uses index
  {$group: {_id: "$product", total: {$sum: "$amount"}}}
])
```

### 3. Limit Pipeline Results Early

```javascript
// Use $limit after $sort when possible
db.posts.aggregate([
  {$match: {category: "tech"}},
  {$sort: {views: -1}},
  {$limit: 100},  // Limit before expensive operations
  {$lookup: {
    from: "comments",
    localField: "_id",
    foreignField: "postId",
    as: "comments"
  }}
])
```

### 4. Use $project to Reduce Data

```javascript
// Remove unnecessary fields early
db.users.aggregate([
  {$match: {status: "active"}},
  {$project: {
    name: 1,
    email: 1,
    age: 1
    // Large fields like 'profile' not included
  }},
  {$group: {_id: "$age", count: {$sum: 1}}}
])
```

### 5. Optimize $lookup

```javascript
// Use pipeline syntax for more control
db.orders.aggregate([
  {$lookup: {
    from: "inventory",
    let: {item: "$item"},
    pipeline: [
      {$match: {
        $expr: {$eq: ["$sku", "$$item"]}
      }},
      {$project: {name: 1, price: 1}}  // Limit fields
    ],
    as: "itemDetails"
  }}
])
```

---

## Schema Design for Performance

### 1. Embedding vs Referencing

```javascript
// Embedding - Good for 1:1 or 1:few relationships
{
  _id: ObjectId("..."),
  name: "John",
  address: {  // Embedded
    street: "123 Main St",
    city: "Boston"
  }
}

// Referencing - Good for 1:many or many:many
{
  _id: ObjectId("..."),
  name: "John",
  orderIds: [ObjectId("..."), ObjectId("...")]  // References
}
```

### 2. Denormalization for Read Performance

```javascript
// Denormalized for performance
{
  _id: ObjectId("..."),
  productId: ObjectId("..."),
  productName: "Laptop",      // Denormalized
  productPrice: 999,          // Denormalized
  quantity: 2,
  orderDate: new Date()
}
```

### 3. Bucketing Pattern

```javascript
// Instead of one document per measurement
// Use buckets for time-series data
{
  _id: ObjectId("..."),
  sensorId: "sensor123",
  startTime: ISODate("2024-01-01T00:00:00Z"),
  endTime: ISODate("2024-01-01T01:00:00Z"),
  measurements: [
    {time: ISODate("2024-01-01T00:00:00Z"), value: 23.5},
    {time: ISODate("2024-01-01T00:01:00Z"), value: 23.6},
    // ... up to 60 measurements
  ],
  count: 60,
  avgValue: 23.55
}
```

### 4. Computed Pattern

```javascript
// Pre-compute expensive aggregations
{
  _id: ObjectId("..."),
  productId: ObjectId("..."),
  // Computed fields updated periodically
  totalReviews: 1523,
  averageRating: 4.2,
  ratingDistribution: {
    5: 876,
    4: 423,
    3: 156,
    2: 45,
    1: 23
  },
  lastUpdated: ISODate("2024-01-01T00:00:00Z")
}
```

---

## Monitoring and Profiling

### Enable Profiling

```javascript
// Enable profiling for slow queries (>100ms)
db.setProfilingLevel(1, {slowms: 100})

// Profile all queries (use carefully in production)
db.setProfilingLevel(2)

// Check profiling status
db.getProfilingStatus()

// View profiled queries
db.system.profile.find().limit(5).sort({ts: -1}).pretty()
```

### Key Metrics to Monitor

```javascript
// Current operations
db.currentOp({
  "active": true,
  "secs_running": {$gt: 3}
})

// Kill long-running operation
db.killOp(opid)

// Collection statistics
db.collection.stats()

// Index usage statistics
db.collection.aggregate([{$indexStats: {}}])
```

### Performance Monitoring Queries

```javascript
// Find slow queries from profile
db.system.profile.find({
  millis: {$gt: 100}
}).sort({ts: -1})

// Find queries not using indexes
db.system.profile.find({
  "planSummary": "COLLSCAN"
})

// Find most frequent queries
db.system.profile.aggregate([
  {$group: {
    _id: "$command.filter",
    count: {$sum: 1},
    avgMillis: {$avg: "$millis"}
  }},
  {$sort: {count: -1}},
  {$limit: 10}
])
```

---

## Common Anti-Patterns

### 1. Large In-Memory Sorts

```javascript
// Bad: Sorting without index
db.large_collection.find().sort({field: 1})

// Solution: Create index
db.large_collection.createIndex({field: 1})
```

### 2. Unbounded Arrays

```javascript
// Bad: Arrays that grow without limit
{
  postId: ObjectId("..."),
  comments: [/* Could grow to thousands */]
}

// Good: Bucket pattern or separate collection
{
  postId: ObjectId("..."),
  commentCount: 1523,
  recentComments: [/* Last 10 comments */]
}
```

### 3. Case-Insensitive Queries Without Index

```javascript
// Bad: Regex for case-insensitive
db.users.find({email: /^john@example.com$/i})

// Good: Store lowercase version
db.users.createIndex({emailLower: 1})
db.users.find({emailLower: "john@example.com"})
```

### 4. Using count() on Large Collections

```javascript
// Bad: Exact count on large collection
db.large_collection.count()

// Good: Use estimatedDocumentCount()
db.large_collection.estimatedDocumentCount()

// Or maintain counters
db.stats.findOneAndUpdate(
  {_id: "collection_count"},
  {$inc: {count: 1}}
)
```

---

## Performance Testing

### Load Testing Script

```javascript
// Simple performance test
function perfTest(iterations) {
  const times = [];

  for(let i = 0; i < iterations; i++) {
    const start = new Date();

    // Your query here
    db.collection.find({field: "value"}).toArray();

    const end = new Date();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);

  print(`Avg: ${avg}ms, Max: ${max}ms, Min: ${min}ms`);
}

perfTest(100);
```

### Index Impact Analysis

```javascript
// Compare performance with and without index
function compareIndexPerformance() {
  // Without index
  db.test.dropIndexes();
  const withoutIndex = db.test.find({field: "value"})
    .explain("executionStats").executionStats;

  // With index
  db.test.createIndex({field: 1});
  const withIndex = db.test.find({field: "value"})
    .explain("executionStats").executionStats;

  print("Without Index:");
  print(`  Time: ${withoutIndex.executionTimeMillis}ms`);
  print(`  Docs Examined: ${withoutIndex.totalDocsExamined}`);

  print("With Index:");
  print(`  Time: ${withIndex.executionTimeMillis}ms`);
  print(`  Docs Examined: ${withIndex.totalDocsExamined}`);
}
```

---

## Quick Reference

### Performance Checklist

- [ ] Use `explain()` on slow queries
- [ ] Create indexes for frequent queries
- [ ] Use projection to limit returned fields
- [ ] Place $match and $sort early in aggregation pipelines
- [ ] Avoid negation operators when possible
- [ ] Use covered queries for read-heavy operations
- [ ] Monitor with profiling in development
- [ ] Test with production-like data volumes
- [ ] Review and remove unused indexes
- [ ] Use appropriate write concern for your needs

### Useful Commands

```javascript
// Show all indexes
db.collection.getIndexes()

// Show index sizes
db.collection.stats().indexSizes

// Rebuild indexes
db.collection.reIndex()

// Validate collection
db.collection.validate()

// Compact collection
db.runCommand({compact: "collection"})
```

---

## Resources

- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/manual/performance/)
- [Index Strategies](https://www.mongodb.com/docs/manual/applications/indexes/)
- [Aggregation Pipeline Optimization](https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/)
- [MongoDB University - Performance Course](https://university.mongodb.com/)

---

*Last updated: December 2024*