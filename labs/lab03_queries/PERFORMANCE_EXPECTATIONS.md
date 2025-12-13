# Lab 03 - Performance Expectations and Benchmarks

## Overview

This document defines the performance expectations for Lab 03 queries and operations. These benchmarks serve as targets for optimization exercises and help students understand the impact of indexing and query optimization.

---

## Performance Targets by Query Type

### 1. Simple Queries (Single Field)

| Query Type | Without Index | With Index | Improvement Expected |
|------------|--------------|------------|---------------------|
| Equality Match | 5-10ms | 1-2ms | 5-10x |
| Range Query | 8-12ms | 2-3ms | 4-6x |
| Array Contains | 10-15ms | 2-3ms | 5-7x |
| Exists Check | 5-8ms | 1-2ms | 4-5x |

**Example:**
```javascript
// Equality match
db.movies.find({ year: 2015 })

// With index on 'year'
// Expected: <2ms for 50 documents
```

### 2. Compound Queries (Multiple Fields)

| Query Type | Without Index | With Index | Improvement Expected |
|------------|--------------|------------|---------------------|
| Two Field AND | 10-15ms | 2-3ms | 5-7x |
| Two Field OR | 15-20ms | 3-5ms | 4-5x |
| Range + Equality | 12-18ms | 2-4ms | 6-9x |
| Multiple Ranges | 15-25ms | 3-5ms | 5-8x |

**Example:**
```javascript
// Compound query
db.movies.find({
  year: { $gte: 2015 },
  "imdb.rating": { $gte: 8.0 }
})

// With compound index on (year, imdb.rating)
// Expected: <3ms for selective queries
```

### 3. Text Search Queries

| Query Type | Expected Time | Notes |
|------------|--------------|-------|
| Single Word | 3-5ms | With text index |
| Multi-word | 5-10ms | With text index |
| Phrase Search | 5-8ms | With text index |
| Without Index | N/A | Not supported |

**Example:**
```javascript
// Text search
db.movies.find({ $text: { $search: "space war" } })

// Requires text index
// Expected: <10ms for moderate result sets
```

### 4. Aggregation Pipelines

| Pipeline Complexity | Without Index | With Index | Target Time |
|--------------------|--------------|------------|-------------|
| Simple (1-2 stages) | 10-20ms | 5-10ms | <10ms |
| Medium (3-4 stages) | 20-40ms | 10-20ms | <20ms |
| Complex (5+ stages) | 40-80ms | 20-40ms | <40ms |
| With $lookup | 50-100ms | 25-50ms | <50ms |

**Example:**
```javascript
// Medium complexity aggregation
db.movies.aggregate([
  { $match: { year: { $gte: 2010 } } },
  { $unwind: "$genres" },
  { $group: {
    _id: "$genres",
    count: { $sum: 1 },
    avgRating: { $avg: "$imdb.rating" }
  }},
  { $sort: { count: -1 } }
])

// Expected: <20ms with proper indexing
```

### 5. Sort Operations

| Operation | Without Index | With Index | Improvement |
|-----------|--------------|------------|-------------|
| Sort Only | 8-12ms | 1-2ms | 8-10x |
| Find + Sort | 10-15ms | 2-3ms | 5-7x |
| Sort + Limit | 8-10ms | 1-2ms | 5-8x |
| Multi-key Sort | 15-20ms | 3-4ms | 5-6x |

**Note:** In-memory sorts are limited to 32MB without index.

---

## Index Impact Analysis

### Storage Overhead

| Index Type | Size (per 1000 docs) | Relative to Collection |
|------------|---------------------|------------------------|
| Single Field | ~20KB | 2-3% |
| Compound (2 fields) | ~35KB | 3-5% |
| Compound (3 fields) | ~50KB | 5-7% |
| Multikey (arrays) | ~40-80KB | 4-8% |
| Text Index | ~100-200KB | 10-20% |

### Write Performance Impact

| Operation | No Indexes | 5 Indexes | 10 Indexes |
|-----------|------------|-----------|------------|
| Insert | 1ms | 2-3ms | 3-5ms |
| Update (indexed field) | 1ms | 2-4ms | 4-6ms |
| Update (non-indexed) | 1ms | 1ms | 1ms |
| Delete | 1ms | 2ms | 2-3ms |
| Bulk Insert (1000) | 100ms | 200-300ms | 300-500ms |

---

## Query Optimization Checklist

### Before Optimization
- [ ] Run explain() to understand current execution
- [ ] Note totalDocsExamined vs nReturned ratio
- [ ] Check for COLLSCAN stages
- [ ] Measure baseline performance (multiple runs)

### Optimization Steps
1. **Identify Slow Queries**
   - Target: Queries taking >10ms on small datasets
   - Use profiler: `db.setProfilingLevel(1, { slowms: 10 })`

2. **Create Appropriate Indexes**
   - Follow ESR rule: Equality, Sort, Range
   - Consider compound indexes for multi-field queries
   - Use partial indexes for filtered subsets

3. **Validate Improvements**
   - Target: 5-10x improvement for indexed queries
   - Verify index usage with explain()
   - Check totalDocsExamined reduction

4. **Monitor Production Impact**
   - Track write performance degradation
   - Monitor index size growth
   - Review index usage statistics

---

## Performance Testing Guidelines

### Test Environment Setup
```javascript
// Ensure consistent test environment
db.movies.getPlanCache().clear();  // Clear plan cache
db.adminCommand({ setParameter: 1, internalQueryExecMaxBlockingSortBytes: 33554432 });
```

### Measurement Best Practices

1. **Multiple Iterations**
   - Run each query at least 5-10 times
   - Discard first run (cold cache)
   - Calculate average, min, max, median

2. **Realistic Data Volume**
   - Test with production-like data sizes
   - Consider data distribution impact
   - Test with various selectivity levels

3. **Benchmark Code Example**
```javascript
function benchmarkQuery(query, iterations = 10) {
  // Warmup
  db.movies.find(query).toArray();

  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = new Date();
    db.movies.find(query).toArray();
    const elapsed = new Date() - start;
    times.push(elapsed);
  }

  return {
    avg: times.reduce((a,b) => a+b) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    median: times.sort((a,b) => a-b)[Math.floor(times.length/2)]
  };
}
```

---

## Expected Improvements by Optimization Type

### 1. Adding Single-Field Index
- **Collection Scan → Index Scan**
- Expected improvement: 5-10x
- Best for: High-cardinality fields
- Example: `createIndex({ year: 1 })`

### 2. Adding Compound Index
- **Multiple Indexes → Single Compound**
- Expected improvement: 3-5x
- Best for: Common query patterns
- Example: `createIndex({ genre: 1, "imdb.rating": -1 })`

### 3. Covered Queries
- **Index + Document Fetch → Index Only**
- Expected improvement: 2-3x additional
- Best for: Frequently accessed field subsets
- Requires: Excluding _id in projection

### 4. Aggregation Optimization
- **Late $match → Early $match**
- Expected improvement: 3-10x
- Best for: Reducing pipeline data volume
- Example: Move $match before $unwind

### 5. Sort Optimization
- **In-memory Sort → Index Sort**
- Expected improvement: 5-10x
- Best for: Large result sets
- Eliminates: 32MB sort limit

---

## Performance Anti-Patterns to Avoid

### Query Anti-Patterns
1. **Negation operators without index**
   - `$ne`, `$nin` perform poorly
   - Alternative: Use positive conditions

2. **Regular expressions starting with wildcard**
   - `/.*pattern/` cannot use index effectively
   - Alternative: Use text index or anchor pattern

3. **Large $in arrays**
   - Arrays with >100 elements
   - Alternative: Use range queries or redesign

### Index Anti-Patterns
1. **Over-indexing**
   - More than 10 indexes per collection
   - Impact: Slow writes, increased storage

2. **Low-cardinality indexes**
   - Fields with few unique values
   - Example: boolean fields, status codes

3. **Redundant indexes**
   - Single field index when compound exists
   - Example: `{a:1}` redundant if `{a:1, b:1}` exists

---

## Lab Performance Goals

### Minimum Requirements
- All basic queries execute in <50ms
- Indexed queries show >3x improvement
- No query examines >2x documents returned
- Aggregations complete in <100ms

### Target Performance
- Simple queries: <2ms with index
- Complex queries: <5ms with index
- Aggregations: <20ms with optimization
- Text search: <10ms for common terms

### Stretch Goals
- Achieve covered queries where possible
- All queries examine <1.5x documents returned
- Write performance degradation <2x with indexes
- Index size <20% of collection size

---

## Monitoring and Validation

### Key Metrics to Track
```javascript
// Query performance
db.movies.find(query).explain("executionStats")
// Look for: executionTimeMillis, totalDocsExamined, nReturned

// Index usage
db.movies.aggregate([{ $indexStats: {} }])
// Look for: accesses.ops count

// Collection statistics
db.movies.stats()
// Look for: size, storageSize, totalIndexSize

// Index sizes
db.movies.stats().indexSizes
// Compare: index size vs collection size
```

### Performance Validation Script
```javascript
function validatePerformance() {
  const tests = [
    {
      name: "Simple equality query",
      query: { year: 2015 },
      maxTime: 2,
      maxDocsExamined: 10
    },
    {
      name: "Range query with index",
      query: { "imdb.rating": { $gte: 8.0 } },
      maxTime: 5,
      maxDocsExamined: 20
    },
    {
      name: "Compound query",
      query: { year: { $gte: 2010 }, genres: "Action" },
      maxTime: 5,
      maxDocsExamined: 30
    }
  ];

  tests.forEach(test => {
    const explain = db.movies.find(test.query).explain("executionStats");
    const stats = explain.executionStats;

    const passed =
      stats.executionTimeMillis <= test.maxTime &&
      stats.totalDocsExamined <= test.maxDocsExamined;

    print(`${passed ? '✅' : '❌'} ${test.name}`);
    print(`   Time: ${stats.executionTimeMillis}ms (max: ${test.maxTime}ms)`);
    print(`   Docs examined: ${stats.totalDocsExamined} (max: ${test.maxDocsExamined})`);
  });
}
```

---

## Conclusion

These performance expectations provide concrete targets for optimization exercises in Lab 03. Students should aim to meet the minimum requirements while striving for target performance levels. Regular monitoring and validation ensure that optimizations deliver real-world benefits without excessive overhead.

Remember: Performance optimization is a balance between query speed, write performance, and resource utilization. Always measure and validate improvements in a realistic environment.