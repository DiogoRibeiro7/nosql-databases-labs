# Lab 03 - Advanced Exercises and Challenges

## Overview

These optional advanced exercises extend Lab 03 with more complex scenarios, performance challenges, and real-world optimization problems. Complete these after finishing the main lab tasks.

---

## Advanced Exercise 0: Diagnostics & Resilience Drills (Bonus Track)

### Objective
Practice real operational workflows: profiling workloads, surviving index outages, and safeguarding data quality.

### Tasks

1. **Query Profiler & Index Advisor**
   - Enable profiling at level 1 (slowms ≈ 5ms) and replay a mix of Task 1/Task 2 queries multiple times.
   - Aggregate `db.system.profile` to surface which query shapes are slowest, examine the most docs, or never use indexes.
   - Create `labs/lab03_queries/profiler.js` to reset profiling data, run the workload, and print the top 5 offenders with metrics `{ns, millisAvg, docsExaminedAvg, usedIndex}`.
   - Document index recommendations or redundant indexes in `diagnostics.md`.

2. **Index Stress Test & Recovery**
   - Pick two “must-have” indexes from Task 3 (e.g., `genres_1_imdb.rating_-1`, `directors_1_year_-1`).
   - Capture explain metrics, drop the indexes, rerun the queries, and note the regression (execution time, docs examined, stage).
   - Recreate the indexes with new options (different field order, partial filter, etc.) and compare results.
   - Summarize lessons learned in `diagnostics.md`: which queries regressed most and which rebuild variant performed best.

3. **Data Integrity Watchdog**
   - Write `labs/lab03_queries/data_quality.js` containing an aggregation pipeline that flags anomalies such as:
     - `imdb.rating` outside 0–10
     - `runtime` ≤ 0
     - Missing/invalid `lastupdated`
     - `awards.wins` present but `awards.text` missing
   - Output documents shaped as `{ _id: { issue: <string> }, count, sampleIds: [...] }` and optionally `$merge` results into `movies_qa`.
   - Add remediation ideas (e.g., normalization rules) to `diagnostics.md`.

### Deliverables

- `labs/lab03_queries/profiler.js`
- `labs/lab03_queries/data_quality.js`
- `labs/lab03_queries/diagnostics.md`

Treat this track as ~45–60 minutes of extra credit; partial results are still valuable if well documented.

---

## Advanced Exercise 1: Query Pattern Analysis

### Objective
Analyze real-world query patterns and optimize for specific use cases.

### Tasks

1. **Create a Query Profiler**

   Build a script that profiles different query patterns:
   ```javascript
   // Enable profiling
   db.setProfilingLevel(2, { slowms: 1 });

   // Run various queries...

   // Analyze profile collection
   db.system.profile.aggregate([
     { $group: {
       _id: { ns: "$ns", op: "$op" },
       count: { $sum: 1 },
       avgTime: { $avg: "$millis" },
       maxTime: { $max: "$millis" }
     }},
     { $sort: { "avgTime": -1 } }
   ]);
   ```

2. **Identify Query Patterns**
   - Find the top 10 most frequent query patterns
   - Calculate average execution time per pattern
   - Identify queries that would benefit most from indexing

3. **Create a Query Recommendation Engine**
   ```javascript
   function recommendIndex(query) {
     // Analyze query structure
     // Recommend optimal index based on:
     // - Fields used in equality conditions
     // - Fields used in range conditions
     // - Sort fields
     // Return recommended index specification
   }
   ```

### Expected Output
Create `query_analysis.js` with your profiler and recommendation engine.

---

## Advanced Exercise 2: Partial and Sparse Indexes

### Objective
Optimize storage and performance using partial and sparse indexes.

### Scenario
The movie collection has many optional fields. Create efficient indexes that only include relevant documents.

### Tasks

1. **Partial Index for Recent Movies**
   ```javascript
   // Index only movies from last 5 years
   db.movies.createIndex(
     { "imdb.rating": -1 },
     {
       partialFilterExpression: {
         year: { $gte: 2019 }
       }
     }
   );
   ```

2. **Sparse Index for Awards**
   ```javascript
   // Index only movies with awards
   db.movies.createIndex(
     { "awards.wins": -1 },
     { sparse: true }
   );
   ```

3. **Compare Performance**
   - Query movies with and without the partial filter
   - Measure index size difference
   - Document space savings

4. **Create Specialized Indexes**
   - High-rated recent movies (rating > 8, year > 2015)
   - Award-winning dramas (has awards, genre includes Drama)
   - Long movies with good ratings (runtime > 150, rating > 7)

### Deliverable
Document findings in `partial_indexes.md` with performance comparisons.

---

## Advanced Exercise 3: Index Intersection vs. Compound Indexes

### Objective
Understand when MongoDB uses index intersection and compare with compound indexes.

### Tasks

1. **Create Multiple Single-Field Indexes**
   ```javascript
   db.movies.createIndex({ year: 1 });
   db.movies.createIndex({ "imdb.rating": 1 });
   db.movies.createIndex({ genres: 1 });
   ```

2. **Test Index Intersection**
   ```javascript
   // Query that could use index intersection
   db.movies.find({
     year: 2015,
     "imdb.rating": { $gte: 8 },
     genres: "Action"
   }).explain("executionStats");
   ```

3. **Create Equivalent Compound Index**
   ```javascript
   db.movies.createIndex({
     year: 1,
     "imdb.rating": 1,
     genres: 1
   });
   ```

4. **Performance Comparison**
   - Document when MongoDB chooses intersection
   - Compare performance metrics
   - Analyze storage overhead
   - Determine best practice guidelines

### Analysis Questions
- When does MongoDB use index intersection?
- What are the performance trade-offs?
- When should you use compound indexes instead?

---

## Advanced Exercise 4: Aggregation Pipeline Optimization

### Objective
Optimize complex aggregation pipelines for performance.

### Challenge Pipeline
```javascript
// Inefficient pipeline - optimize this!
db.movies.aggregate([
  { $unwind: "$cast" },
  { $unwind: "$genres" },
  { $lookup: {
    from: "users",
    localField: "_id",
    foreignField: "watchedMovies",
    as: "viewers"
  }},
  { $match: { year: { $gte: 2010 } } },
  { $group: {
    _id: { actor: "$cast", genre: "$genres" },
    avgRating: { $avg: "$imdb.rating" },
    viewerCount: { $sum: { $size: "$viewers" } }
  }},
  { $sort: { viewerCount: -1 } },
  { $limit: 100 }
]);
```

### Optimization Tasks

1. **Reorder Stages**
   - Move $match as early as possible
   - Consider when to $unwind

2. **Eliminate Unnecessary Operations**
   - Can $lookup be avoided?
   - Is double $unwind necessary?

3. **Use Indexes**
   - Create indexes to support $match
   - Consider index for $lookup

4. **Alternative Approaches**
   - Split into multiple simpler pipelines
   - Pre-aggregate common results
   - Use materialized views

### Performance Targets
- Reduce execution time by 50%
- Reduce documents examined by 75%

---

## Advanced Exercise 5: Text Search Optimization

### Objective
Implement advanced text search features with performance optimization.

### Tasks

1. **Weighted Text Index**
   ```javascript
   db.movies.createIndex(
     {
       title: "text",
       plot: "text",
       "awards.text": "text"
     },
     {
       weights: {
         title: 10,
         plot: 5,
         "awards.text": 1
       }
     }
   );
   ```

2. **Language-Specific Search**
   ```javascript
   // Search with language override
   db.movies.find({
     $text: {
       $search: "amour",
       $language: "french"
     }
   });
   ```

3. **Search Score Optimization**
   ```javascript
   // Use text score for ranking
   db.movies.find(
     { $text: { $search: "space war alien" } },
     { score: { $meta: "textScore" } }
   ).sort({ score: { $meta: "textScore" } });
   ```

4. **Implement Search Features**
   - Phrase search with exact matching
   - Negative terms exclusion
   - Fuzzy matching simulation
   - Search result highlighting

### Challenge
Build a search API that returns relevant results in <10ms for common queries.

---

## Advanced Exercise 6: Real-Time Analytics with Change Streams

### Objective
Implement real-time analytics using change streams and optimized queries.

### Setup
```javascript
// Create a change stream
const changeStream = db.movies.watch([
  { $match: {
    "fullDocument.imdb.rating": { $gte: 8.0 }
  }}
]);

// Process changes
changeStream.forEach(change => {
  // Update analytics
});
```

### Tasks

1. **Real-Time Metrics**
   - Track rating changes
   - Monitor new movie additions
   - Detect trending genres

2. **Optimized Analytics Updates**
   - Maintain running averages
   - Update top-N lists efficiently
   - Cache frequently accessed aggregations

3. **Performance Requirements**
   - Process changes in <100ms
   - Update dashboards in real-time
   - Handle 100 changes/second

---

## Advanced Exercise 7: Geospatial Queries

### Objective
Implement location-based features for theaters.

### Tasks

1. **Add Geospatial Data**
   ```javascript
   // Add location to theaters
   db.theaters.updateMany({}, {
     $set: {
       location: {
         type: "Point",
         coordinates: [longitude, latitude]
       }
     }
   });
   ```

2. **Create 2dsphere Index**
   ```javascript
   db.theaters.createIndex({ location: "2dsphere" });
   ```

3. **Implement Location Queries**
   - Find theaters within 5km radius
   - Find nearest N theaters
   - Calculate distances to theaters
   - Find theaters along a route

4. **Performance Optimization**
   - Compare with compound geo indexes
   - Optimize for common search patterns
   - Implement location caching

---

## Advanced Exercise 8: Write Performance Optimization

### Objective
Balance read and write performance with strategic indexing.

### Scenario
The system needs to handle:
- 1000 reads/second
- 100 writes/second
- Real-time analytics

### Tasks

1. **Measure Write Impact**
   ```javascript
   function measureWritePerformance(indexes) {
     // Bulk insert test
     const docs = generateMovies(1000);
     const start = Date.now();
     db.movies.insertMany(docs);
     return Date.now() - start;
   }
   ```

2. **Optimize Index Strategy**
   - Identify minimal index set
   - Use compound indexes strategically
   - Consider index intersection
   - Implement lazy indexing

3. **Bulk Operation Optimization**
   ```javascript
   // Optimized bulk operations
   const bulk = db.movies.initializeUnorderedBulkOp();
   // Add operations...
   bulk.execute();
   ```

4. **Performance Targets**
   - Maintain read query <5ms
   - Keep write operations <10ms
   - Index overhead <25% of data size

---

## Advanced Exercise 9: Query Plan Cache Management

### Objective
Understand and optimize MongoDB's query plan cache.

### Tasks

1. **Analyze Plan Cache**
   ```javascript
   // View cached plans
   db.movies.getPlanCache().list();

   // Clear cache
   db.movies.getPlanCache().clear();
   ```

2. **Force Plan Revaluation**
   ```javascript
   // Add hint to force specific index
   db.movies.find(query).hint({ year: 1 });
   ```

3. **Cache Optimization**
   - Identify frequently changing plans
   - Stabilize plan selection
   - Monitor cache hit rates

---

## Advanced Exercise 10: Custom Scoring and Ranking

### Objective
Implement custom scoring algorithms for movie recommendations.

### Tasks

1. **Create Scoring Function**
   ```javascript
   db.movies.aggregate([
     { $addFields: {
       customScore: {
         $add: [
           { $multiply: ["$imdb.rating", 10] },
           { $multiply: ["$imdb.votes", 0.001] },
           { $cond: {
             if: { $gte: ["$year", 2020] },
             then: 20,
             else: 0
           }},
           { $size: { $ifNull: ["$awards.wins", []] } }
         ]
       }
     }},
     { $sort: { customScore: -1 } }
   ]);
   ```

2. **Optimize Scoring**
   - Pre-calculate scores
   - Create materialized views
   - Index computed fields

3. **Performance Requirements**
   - Return top 100 movies in <20ms
   - Support dynamic weight adjustment
   - Handle 1M+ documents

---

## Submission Requirements

For advanced exercises, create:

1. **`advanced/`** directory with:
   - Solution files for each exercise
   - Performance measurements
   - Analysis documents

2. **`ADVANCED_NOTES.md`** with:
   - Approach for each exercise
   - Performance results
   - Lessons learned
   - Recommendations

3. **Performance Report** including:
   - Before/after metrics
   - Optimization techniques used
   - Trade-offs identified

---

## Evaluation Criteria

Advanced exercises are evaluated on:

1. **Correctness** (30%)
   - Solutions work as intended
   - Edge cases handled

2. **Performance** (40%)
   - Measurable improvements
   - Meeting target metrics

3. **Analysis** (30%)
   - Understanding of trade-offs
   - Quality of recommendations
   - Documentation clarity

---

## Tips for Success

1. **Measure Everything**
   - Use explain() extensively
   - Profile actual workloads
   - Document baseline performance

2. **Think Holistically**
   - Consider read/write balance
   - Evaluate storage costs
   - Plan for scale

3. **Test Realistically**
   - Use production-like data volumes
   - Simulate concurrent operations
   - Consider cache effects

4. **Document Thoroughly**
   - Explain reasoning
   - Show evidence
   - Provide recommendations
