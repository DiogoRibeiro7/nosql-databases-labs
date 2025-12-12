# Lab 03 – Advanced Queries and Index Design

## Objectives

By the end of this lab you should be able to:

- Write complex queries using MongoDB query operators and expressions.
- Use the aggregation pipeline for data transformation and analysis.
- Design and implement effective indexes to optimize query performance.
- Analyze query execution plans using `explain()`.
- Understand index types and their appropriate use cases.
- Identify and resolve performance bottlenecks.

---

## 1. Setup

### 1.1. Prerequisites

- MongoDB installed (local or Docker)
- Completion of Lab 01 and Lab 02 (or understanding of basic CRUD and data modeling)

### 1.2. Dataset

A sample dataset representing a movie database is provided in:

```text
labs/lab03_queries/starter/data/movies.json
labs/lab03_queries/starter/data/theaters.json
labs/lab03_queries/starter/data/users.json
```

This dataset includes:

- **movies**: ~1000 movie documents with titles, genres, ratings, cast, directors, etc.
- **theaters**: Theater locations with embedded screening schedules
- **users**: User profiles with viewing history and preferences

---

## 2. Dataset Import

Import the datasets using:

```bash
mongoimport \
  --db lab03_movies \
  --collection movies \
  --file labs/lab03_queries/starter/data/movies.json \
  --jsonArray

mongoimport \
  --db lab03_movies \
  --collection theaters \
  --file labs/lab03_queries/starter/data/theaters.json \
  --jsonArray

mongoimport \
  --db lab03_movies \
  --collection users \
  --file labs/lab03_queries/starter/data/users.json \
  --jsonArray
```

Verify the import:

```javascript
use lab03_movies
db.movies.countDocuments()
db.theaters.countDocuments()
db.users.countDocuments()
```

---

## 3. Tasks

### Task 1: Complex Queries (25%)

Write queries to answer the following questions. Use query operators such as `$and`, `$or`, `$in`, `$regex`, `$elemMatch`, etc.

1. **Find all movies released between 2010 and 2020** with an IMDb rating greater than 8.0.

2. **Find all movies in the "Drama" or "Thriller" genres** that have won at least one award.

3. **Find all movies** where Tom Hanks appears in the cast.

4. **Find all movies** released in the last 5 years, sorted by IMDb rating (descending), limited to top 20.

5. **Find all theaters** located in New York that have at least one screening scheduled for today.

6. **Find all users** who have watched more than 50 movies and have a preference for "Sci-Fi" genre.

7. **Find movies with specific runtime**: Between 90 and 120 minutes, excluding documentaries.

8. **Text search**: Find all movies with "space" or "alien" in the title or plot.

Save your queries in a file named:

```text
labs/lab03_queries/queries.js
```

---

### Task 2: Aggregation Pipeline (30%)

Use the aggregation pipeline to perform the following analyses:

1. **Average IMDb rating by genre**
   - Group movies by genre
   - Calculate average rating for each genre
   - Sort by average rating (descending)

2. **Top 10 directors by number of movies**
   - Count movies per director
   - Show director name and movie count
   - Sort by movie count (descending)

3. **Movies per year with average rating**
   - Group by release year
   - Show year, count of movies, and average rating
   - Filter years with at least 10 movies
   - Sort by year (descending)

4. **Most popular cast members**
   - Unwind the cast array
   - Count appearances per actor
   - Show top 15 actors by appearance count

5. **Revenue analysis by genre** (if revenue data exists)
   - Calculate total and average revenue per genre
   - Sort by total revenue

6. **User viewing patterns**
   - For each user, show total movies watched
   - Calculate average rating given
   - Group by favorite genre

7. **Theater utilization**
   - For each theater, count total screenings
   - Calculate average screenings per day
   - Identify theaters with most screenings

8. **Advanced**: Movies with highest rating variance
   - Calculate the difference between IMDb and user ratings
   - Find movies with biggest discrepancies

Save your aggregation pipelines in:

```text
labs/lab03_queries/aggregations.js
```

---

### Task 3: Index Design and Optimization (30%)

#### 3.1. Baseline Performance

Before creating indexes, analyze the performance of these queries:

```javascript
// Query 1: Find movies by genre
db.movies.find({ genres: "Action" }).explain("executionStats")

// Query 2: Find movies by year and rating
db.movies.find({ year: 2015, "imdb.rating": { $gt: 7.0 } }).explain("executionStats")

// Query 3: Find movies by director
db.movies.find({ directors: "Christopher Nolan" }).explain("executionStats")

// Query 4: Text search
db.movies.find({ $text: { $search: "space adventure" } }).explain("executionStats")
```

Document the following for each query:
- Execution time (ms)
- Documents examined
- Documents returned
- Index used (if any)

#### 3.2. Create Indexes

Design and create indexes to optimize the queries above:

1. **Single-field indexes**:
   - On `genres` (for genre filtering)
   - On `year` (for year filtering)
   - On `imdb.rating` (for rating filtering)
   - On `directors` (for director queries)

2. **Compound indexes**:
   - On `(genres, imdb.rating)` for filtering by genre and rating
   - On `(year, imdb.rating)` for year + rating queries
   - On `(directors, year)` for director + year queries

3. **Text index**:
   - On `title` and `plot` for full-text search

4. **Array index**:
   - On `cast` array for actor queries

5. **Multikey index**:
   - On embedded fields like `awards.wins`

#### 3.3. Post-Index Performance

Re-run the queries from 3.1 with `explain("executionStats")` and document improvements:

- New execution time
- Index used
- Performance improvement percentage

#### 3.4. Index Trade-offs

Answer the following questions in your `NOTES.md`:

1. What is the storage overhead of your indexes? (Check with `db.movies.stats()`)
2. How do indexes affect write performance? (Discuss, no need to measure)
3. Which indexes provide the most significant performance improvements?
4. Are there any redundant indexes? If so, which ones and why?
5. What is the difference between a covered query and a non-covered query?

Save your index creation commands in:

```text
labs/lab03_queries/indexes.js
```

---

### Task 4: Query Optimization Analysis (15%)

Choose **three** slow queries from your work above and:

1. **Document the original query** and its execution plan
2. **Identify the bottleneck** (no index, wrong index, full collection scan, etc.)
3. **Propose a solution** (create index, rewrite query, use aggregation, etc.)
4. **Implement the solution** and measure improvement
5. **Document results** in `NOTES.md` with before/after metrics

Include:
- Execution time before and after
- Documents examined before and after
- Explanation of why the optimization worked

---

## 4. What to Submit

Inside `labs/lab03_queries/`, you should have:

* `queries.js` – Complex queries from Task 1
* `aggregations.js` – Aggregation pipelines from Task 2
* `indexes.js` – Index creation commands from Task 3
* `NOTES.md` – Analysis, performance results, and optimization explanations
* Optional: Screenshots of explain plans or performance graphs

Follow the general submission workflow in
[`instructions/submission_guide.md`](../../instructions/submission_guide.md).

---

## 5. Grading (summary)

This lab will be graded according to the general rubric in
[`instructions/grading_rubric.md`](../../instructions/grading_rubric.md). A typical breakdown is:

* **Complex queries (Task 1)**: 25%
  - Correctness of queries
  - Use of appropriate operators
  - Query clarity and efficiency

* **Aggregation pipelines (Task 2)**: 30%
  - Correct use of aggregation stages
  - Complexity and completeness
  - Result accuracy

* **Index design and optimization (Task 3)**: 30%
  - Appropriate index selection
  - Performance improvements
  - Understanding of trade-offs

* **Query optimization analysis (Task 4)**: 15%
  - Quality of analysis
  - Problem identification
  - Solution effectiveness

---

## 6. Tips and Best Practices

### 6.1. Using `explain()`

```javascript
// Basic explain
db.collection.find({ field: value }).explain()

// Execution statistics (more detailed)
db.collection.find({ field: value }).explain("executionStats")

// Full query planner info
db.collection.find({ field: value }).explain("allPlansExecution")
```

### 6.2. Key Metrics to Watch

- **executionTimeMillis**: Total query time
- **totalDocsExamined**: How many documents were scanned
- **totalKeysExamined**: How many index keys were scanned
- **nReturned**: Number of documents returned
- **stage**: IXSCAN (good) vs COLLSCAN (bad)

### 6.3. Index Best Practices

1. **ESR Rule** (Equality, Sort, Range):
   - Put equality conditions first
   - Then sort fields
   - Finally range conditions

2. **Selectivity**: Index fields that filter out most documents first

3. **Covered Queries**: Include all queried fields in the index

4. **Limit Indexes**: Too many indexes slow down writes

### 6.4. Aggregation Pipeline Optimization

1. **$match early**: Filter documents as early as possible
2. **$project early**: Reduce document size early in pipeline
3. **$limit early**: Limit results before expensive operations
4. **Use indexes**: Ensure $match stages can use indexes
5. **Avoid $lookup**: Use embedding when possible

---

## 7. Optional Extensions

These are not required but recommended for deeper learning:

1. **Geospatial Queries**:
   - Add location data to theaters
   - Create 2dsphere index
   - Find theaters near a coordinate

2. **Time-Series Analysis**:
   - Analyze movie releases over time
   - Identify trends by genre/year

3. **Advanced Text Search**:
   - Experiment with text search weights
   - Use text search scores for ranking

4. **Index Intersection**:
   - Create multiple single-field indexes
   - Let MongoDB use index intersection
   - Compare with compound indexes

5. **Performance Testing**:
   - Generate larger dataset (10K+ movies)
   - Measure index impact on writes
   - Compare query performance at scale

If you complete any extensions, document them in `NOTES.md`.

---

## 8. Resources

- [MongoDB Query Operators](https://docs.mongodb.com/manual/reference/operator/query/)
- [Aggregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
- [Indexes](https://docs.mongodb.com/manual/indexes/)
- [Analyze Query Performance](https://docs.mongodb.com/manual/tutorial/analyze-query-plan/)
- [ESR Rule for Compound Indexes](https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-rule/)
