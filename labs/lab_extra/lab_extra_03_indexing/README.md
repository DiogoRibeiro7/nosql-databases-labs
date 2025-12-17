# Lab Extra 03 – Indexing Strategies & Advanced Performance

## Objectives

By the end of this lab you should be able to:

- Design and implement optimal indexing strategies
- Understand different index types and their use cases
- Use explain plans to optimize query performance
- Implement text search and geospatial queries
- Monitor and diagnose performance issues
- Apply advanced optimization techniques

---

## Prerequisites

- Completion of Labs 1-5
- MongoDB 5.0+ installed
- Understanding of database indexing concepts
- Sample dataset loaded (provided in setup)

---

## 1. Index Fundamentals

### 1.1 Why Indexes Matter

Without indexes, MongoDB performs collection scans:

- **O(n) complexity** for every query
- **Full collection** read into memory
- **Poor performance** as data grows

With proper indexes:

- **O(log n) complexity** for B-tree traversal
- **Targeted reads** of relevant documents
- **Scalable performance**

### 1.2 Index Structure

```
B-Tree Index Structure:
         [50]
        /    \
    [20,30]  [70,80]
    /  |  \   /  |  \
  [10][25][35][60][75][90]
```

---

## 2. Index Types

### 2.1 Single Field Index

```javascript
// Basic single field index
db.users.createIndex({ username: 1 }); // Ascending
db.users.createIndex({ age: -1 }); // Descending

// Index with options
db.users.createIndex(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    background: true,
  }
);
```

### 2.2 Compound Index

```javascript
// Compound index (order matters!)
db.orders.createIndex({ customerId: 1, orderDate: -1 });

// Supports queries on:
// - customerId
// - customerId + orderDate
// Does NOT support efficient queries on orderDate alone
```

### 2.3 Multikey Index

```javascript
// Automatically created for array fields
db.products.createIndex({ tags: 1 });

// Document: { name: "Laptop", tags: ["electronics", "computers", "portable"] }
// Creates index entries for each array element
```

### 2.4 Text Index

```javascript
// Full-text search index
db.articles.createIndex({ content: "text", title: "text" });

// Search usage
db.articles.find({ $text: { $search: "mongodb indexing" } });

// With score
db.articles
  .find({ $text: { $search: "performance" } }, { score: { $meta: "textScore" } })
  .sort({ score: { $meta: "textScore" } });
```

### 2.5 Geospatial Indexes

```javascript
// 2dsphere index for GeoJSON
db.locations.createIndex({ location: "2dsphere" });

// Find nearby
db.locations.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [-73.97, 40.77] },
      $maxDistance: 1000,
    },
  },
});

// 2d index for legacy coordinates
db.places.createIndex({ coordinates: "2d" });
```

### 2.6 Hashed Index

```javascript
// For shard key distribution
db.users.createIndex({ userId: "hashed" });
```

### 2.7 Wildcard Index

```javascript
// Index all fields in subdocument
db.products.createIndex({ "attributes.$**": 1 });

// Specific wildcard paths
db.logs.createIndex(
  { "metadata.$**": 1 },
  { wildcardProjection: { "metadata.user": 1, "metadata.action": 1 } }
);
```

---

## 3. Index Selection Strategy

### 3.1 ESR Rule (Equality, Sort, Range)

Optimal compound index order:

```javascript
// Query pattern
db.products
  .find({
    category: "Electronics", // Equality
    price: { $gte: 100, $lte: 500 }, // Range
  })
  .sort({ rating: -1 }); // Sort

// Optimal index
db.products.createIndex({
  category: 1, // Equality first
  rating: -1, // Sort second
  price: 1, // Range last
});
```

### 3.2 Index Selectivity

```javascript
// High selectivity (good)
db.users.createIndex({ email: 1 }); // Unique values

// Low selectivity (poor)
db.users.createIndex({ gender: 1 }); // Only 2-3 values

// Compound index for low selectivity fields
db.users.createIndex({ gender: 1, age: 1, city: 1 });
```

---

## 4. Query Optimization

### 4.1 Using Explain

```javascript
// Basic explain
db.orders.find({ customerId: "C123" }).explain();

// Detailed execution stats
db.orders.find({ customerId: "C123" }).explain("executionStats");

// All plans considered
db.orders.find({ customerId: "C123" }).explain("allPlansExecution");
```

### 4.2 Interpreting Explain Output

```javascript
{
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 10,           // Documents returned
    "executionTimeMillis": 2,   // Total time
    "totalKeysExamined": 10,    // Index keys scanned
    "totalDocsExamined": 10,    // Documents scanned
    "executionStages": {
      "stage": "IXSCAN",        // Index scan (good!)
      // "stage": "COLLSCAN",   // Collection scan (bad!)
      "indexName": "customerId_1_orderDate_-1"
    }
  }
}
```

### 4.3 Query Optimization Patterns

```javascript
// Covered query (best performance)
db.orders.find({ customerId: "C123" }, { orderId: 1, orderDate: 1, _id: 0 });
// Index: { customerId: 1, orderId: 1, orderDate: 1 }

// Index intersection
db.users.find({
  age: { $gte: 25, $lte: 35 },
  city: "New York",
});
// Can use two separate indexes

// Hint specific index
db.orders.find({ status: "pending" }).hint({ status: 1, createdAt: -1 });
```

---

## 5. Performance Monitoring

### 5.1 Database Profiler

```javascript
// Enable profiling
db.setProfilingLevel(1, { slowms: 100 }); // Log queries > 100ms

// Level 0: Off
// Level 1: Slow queries only
// Level 2: All queries

// Query profiler data
db.system.profile
  .find({
    millis: { $gt: 100 },
  })
  .sort({ ts: -1 })
  .limit(10);

// Analyze slow queries
db.system.profile.aggregate([
  { $match: { millis: { $gt: 100 } } },
  {
    $group: {
      _id: { ns: "$ns", op: "$op" },
      count: { $sum: 1 },
      avgMillis: { $avg: "$millis" },
      maxMillis: { $max: "$millis" },
    },
  },
  { $sort: { maxMillis: -1 } },
]);
```

### 5.2 Index Usage Statistics

```javascript
// Get index usage stats
db.orders.aggregate([{ $indexStats: {} }]);

// Find unused indexes
db.orders.aggregate([{ $indexStats: {} }, { $match: { "accesses.ops": { $lt: 100 } } }]);
```

### 5.3 Current Operations

```javascript
// Find long-running operations
db.currentOp({
  active: true,
  secs_running: { $gt: 3 },
});

// Kill operation
db.killOp(opId);
```

---

## 6. Advanced Optimization Techniques

### 6.1 Index Hints and Force

```javascript
// Force index usage
db.orders.find({ status: "pending" }).hint({ status: 1, createdAt: -1 });

// Force collection scan (testing)
db.orders.find({ status: "pending" }).hint({ $natural: 1 });
```

### 6.2 Index Intersection

```javascript
// MongoDB can use multiple indexes
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });

// This query can use both indexes
db.products.find({
  category: "Electronics",
  price: { $lt: 500 },
});
```

### 6.3 Partial Indexes

```javascript
// Index only specific documents
db.orders.createIndex(
  { customerId: 1, orderDate: -1 },
  { partialFilterExpression: { status: "active" } }
);

// Saves space, improves write performance
```

### 6.4 TTL Indexes

```javascript
// Automatically delete old documents
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 } // Delete after 1 hour
);

db.logs.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 } // Delete at specific time
);
```

---

## 7. Text Search Optimization

### 7.1 Text Index Configuration

```javascript
// Custom language and weights
db.articles.createIndex(
  { title: "text", content: "text", tags: "text" },
  {
    weights: { title: 10, tags: 5, content: 1 },
    default_language: "english",
    language_override: "lang",
  }
);
```

### 7.2 Text Search Queries

```javascript
// Basic search
db.articles.find({ $text: { $search: "mongodb performance" } });

// Phrase search
db.articles.find({ $text: { $search: '"exact phrase"' } });

// Exclude terms
db.articles.find({ $text: { $search: "mongodb -sql" } });

// With additional filters
db.articles.find({
  $text: { $search: "indexing" },
  category: "database",
  publishDate: { $gte: ISODate("2024-01-01") },
});
```

---

## 8. Geospatial Performance

### 8.1 Optimizing Geo Queries

```javascript
// Efficient bounding box query
db.locations.find({
  location: {
    $geoWithin: {
      $box: [
        [-74, 40],
        [-73, 41],
      ],
    },
  },
});

// Proximity with limit
db.restaurants
  .find({
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [-73.97, 40.77] },
        $maxDistance: 1000,
      },
    },
  })
  .limit(10);
```

---

## 9. Exercises

### Exercise 1: Design Optimal Indexes

Given these query patterns, design the optimal indexes:

```javascript
// Query 1: Find active users by age range and city
db.users.find({
  status: "active",
  age: { $gte: 25, $lte: 35 },
  city: "New York"
}).sort({ lastLogin: -1 })

// Query 2: Full-text search on products
db.products.find({
  $text: { $search: "laptop" },
  category: "Electronics",
  price: { $lt: 1000 }
})

// Query 3: Find nearby restaurants
db.restaurants.find({
  location: { $near: {...} },
  cuisine: "Italian",
  rating: { $gte: 4.0 }
})
```

### Exercise 2: Query Optimization

Optimize this slow query:

```javascript
// Current slow query
db.orders
  .find({
    $or: [{ status: "pending" }, { status: "processing" }],
    customerId: {
      $in: [
        /* 1000 IDs */
      ],
    },
    totalAmount: { $gt: 100 },
  })
  .sort({ orderDate: -1 });

// TODO: Create indexes and rewrite query
```

### Exercise 3: Performance Diagnosis

Diagnose and fix performance issues:

```javascript
// Setup performance monitoring
// Identify slow queries
// Create missing indexes
// Verify improvements
```

---

## 10. Best Practices

1. **Index Strategy**
   - Create indexes to support queries, not data
   - Follow ESR rule for compound indexes
   - Remove unused indexes

2. **Monitoring**
   - Enable profiling in development
   - Monitor index usage regularly
   - Track query performance metrics

3. **Optimization**
   - Use covered queries when possible
   - Avoid $where and JavaScript execution
   - Limit result sets with projection

4. **Maintenance**
   - Rebuild indexes periodically
   - Update statistics regularly
   - Plan index changes carefully

---

## Testing

Run the complete test suite:

```bash
npm test
```

Individual tests:

- `test_indexes.js` - Index creation and validation
- `test_performance.js` - Query performance tests
- `test_optimization.js` - Optimization verification

---

## Additional Resources

- [MongoDB Indexing Documentation](https://docs.mongodb.com/manual/indexes/)
- [Query Optimization](https://docs.mongodb.com/manual/core/query-optimization/)
- [Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Index Strategies](https://docs.mongodb.com/manual/applications/indexes/)

---

## Feedback & Collaboration

- Use [GitHub Issues](https://github.com/diogoribeiro7/nosql-databases-labs/issues) with the `lab_extra_03` label to flag documentation gaps or request new profiling scenarios.
- Share explain-plan screenshots, profiler workflows, or benchmark scripts in [Discussions](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) so others can replicate your findings.
