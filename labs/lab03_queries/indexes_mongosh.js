// Lab 03 - Index Design and Optimization
// Database: lab03_movies
// Collection: movies, theaters, users

use lab03_movies

// ========================================
// TASK 3: INDEX DESIGN AND OPTIMIZATION
// ========================================

// Before creating indexes, analyze baseline performance
// Run these queries with explain() to see COLLSCAN (collection scan)

// BASELINE QUERIES (run these BEFORE creating indexes)
// =======================================================

// Query 1: Find movies by genre (BEFORE index)
db.movies.find({ genres: "Action" }).explain("executionStats");

// Query 2: Find movies by year and rating (BEFORE index)
db.movies.find({ year: 2015, "imdb.rating": { $gt: 7.0 } }).explain("executionStats");

// Query 3: Find movies by director (BEFORE index)
db.movies.find({ directors: "Christopher Nolan" }).explain("executionStats");


// ========================================
// SINGLE-FIELD INDEXES
// ========================================

// 1. Index on genres (for genre filtering)
db.movies.createIndex({ genres: 1 });

// 2. Index on year (for year filtering)
db.movies.createIndex({ year: 1 });

// 3. Index on IMDb rating (for rating filtering and sorting)
db.movies.createIndex({ "imdb.rating": -1 });  // Descending for common sort order

// 4. Index on directors (for director queries)
db.movies.createIndex({ directors: 1 });

// 5. Index on title (for title lookups)
db.movies.createIndex({ title: 1 });

// 6. Index on cast (array index for actor queries)
db.movies.createIndex({ cast: 1 });

// ========================================
// COMPOUND INDEXES
// ========================================

// 7. Compound index on (genres, imdb.rating)
// Useful for: Filter by genre + filter/sort by rating
// ESR Rule: Equality (genres) -> Sort/Range (rating)
db.movies.createIndex({ genres: 1, "imdb.rating": -1 });

// 8. Compound index on (year, imdb.rating)
// Useful for: Filter by year + filter/sort by rating
db.movies.createIndex({ year: -1, "imdb.rating": -1 });

// 9. Compound index on (directors, year)
// Useful for: Find director's movies sorted by year
db.movies.createIndex({ directors: 1, year: -1 });

// 10. Compound index on (genres, year, imdb.rating)
// Useful for: Find movies by genre and year range, sorted by rating
db.movies.createIndex({ genres: 1, year: -1, "imdb.rating": -1 });

// ========================================
// TEXT INDEX
// ========================================

// 11. Text index on title and plot for full-text search
db.movies.createIndex(
  {
    title: "text",
    plot: "text"
  },
  {
    weights: {
      title: 10,    // Title matches are more important
      plot: 5
    },
    name: "movie_text_index"
  }
);

// ========================================
// INDEXES ON EMBEDDED FIELDS
// ========================================

// 12. Index on embedded field (awards.wins)
db.movies.createIndex({ "awards.wins": -1 });

// 13. Index on embedded field (awards.nominations)
db.movies.createIndex({ "awards.nominations": -1 });

// 14. Index on IMDb votes (for finding highly-voted movies)
db.movies.createIndex({ "imdb.votes": -1 });

// ========================================
// INDEXES FOR THEATERS COLLECTION
// ========================================

// 15. Index on theater location city
db.theaters.createIndex({ "location.city": 1 });

// 16. Index on screening times
db.theaters.createIndex({ "screenings.time": 1 });

// 17. Compound index for location-based screening queries
db.theaters.createIndex({ "location.city": 1, "screenings.time": 1 });

// 18. Index on capacity (for finding large theaters)
db.theaters.createIndex({ capacity: -1 });

// ========================================
// INDEXES FOR USERS COLLECTION
// ========================================

// 19. Index on username (for login/lookup)
db.users.createIndex({ username: 1 }, { unique: true });

// 20. Index on email (for login/lookup)
db.users.createIndex({ email: 1 }, { unique: true });

// 21. Index on total_movies_watched (for finding active users)
db.users.createIndex({ total_movies_watched: -1 });

// 22. Index on favorite genres
db.users.createIndex({ "preferences.favorite_genres": 1 });

// 23. Index on viewing history movie_id
db.users.createIndex({ "viewing_history.movie_id": 1 });

// ========================================
// SPECIALIZED INDEXES
// ========================================

// 24. Partial index: Only index high-rated movies (rating >= 8.0)
db.movies.createIndex(
  { "imdb.rating": -1 },
  {
    partialFilterExpression: { "imdb.rating": { $gte: 8.0 } },
    name: "high_rated_movies_idx"
  }
);

// 25. Sparse index: Only index documents with a specific field
db.movies.createIndex(
  { "box_office": -1 },
  { sparse: true, name: "box_office_sparse_idx" }
);

// 26. TTL index for temporary data (example: user sessions)
// Note: This is just an example - not applicable to our current collections
// db.sessions.createIndex({ "created_at": 1 }, { expireAfterSeconds: 3600 });

// ========================================
// COVERED QUERIES EXAMPLE
// ========================================

// 27. Index for covered query (all fields in projection are in index)
db.movies.createIndex({ title: 1, year: 1, "imdb.rating": 1 });

// This query will be covered (no document reads, only index reads)
db.movies.find(
  { title: "Inception" },
  { title: 1, year: 1, "imdb.rating": 1, _id: 0 }
).explain("executionStats");

// ========================================
// VIEW ALL INDEXES
// ========================================

// List all indexes on movies collection
db.movies.getIndexes();

// List all indexes on theaters collection
db.theaters.getIndexes();

// List all indexes on users collection
db.users.getIndexes();

// ========================================
// INDEX STATISTICS
// ========================================

// Get collection statistics (includes index sizes)
db.movies.stats();
db.theaters.stats();
db.users.stats();

// Get index sizes
db.movies.stats().indexSizes;

// ========================================
// ANALYZE INDEX USAGE
// ========================================

// Check if indexes are being used (run after workload)
db.movies.aggregate([{ $indexStats: {} }]);

// ========================================
// POST-INDEX PERFORMANCE TESTING
// ========================================

// Re-run baseline queries with explain() to see IXSCAN (index scan)

// Query 1: Find movies by genre (AFTER index)
db.movies.find({ genres: "Action" }).explain("executionStats");

// Query 2: Find movies by year and rating (AFTER index)
db.movies.find({ year: 2015, "imdb.rating": { $gt: 7.0 } }).explain("executionStats");

// Query 3: Find movies by director (AFTER index)
db.movies.find({ directors: "Christopher Nolan" }).explain("executionStats");

// Query 4: Text search (AFTER index)
db.movies.find({ $text: { $search: "space adventure" } }).explain("executionStats");

// ========================================
// EXAMPLE: COMPARING COVERED VS NON-COVERED QUERY
// ========================================

// Non-covered query (needs to read documents)
db.movies.find(
  { title: "Inception" },
  { title: 1, year: 1, "imdb.rating": 1, plot: 1, _id: 0 }
).explain("executionStats");

// Covered query (all data from index)
db.movies.find(
  { title: "Inception" },
  { title: 1, year: 1, "imdb.rating": 1, _id: 0 }
).explain("executionStats");

// ========================================
// EXAMPLE: ESR RULE (Equality, Sort, Range)
// ========================================

// Good compound index following ESR rule
// Equality: genres = "Action"
// Sort: year descending
// Range: imdb.rating > 7.0
db.movies.createIndex({ genres: 1, year: -1, "imdb.rating": -1 });

// Query that uses the index efficiently
db.movies.find({
  genres: "Action",
  "imdb.rating": { $gt: 7.0 }
}).sort({ year: -1 }).explain("executionStats");

// ========================================
// DROP REDUNDANT INDEXES (if needed)
// ========================================

// If you have both of these indexes, the second one is redundant
// db.movies.createIndex({ genres: 1 });
// db.movies.createIndex({ genres: 1, "imdb.rating": -1 });

// The compound index can be used for queries on just genres
// So the single-field index is redundant

// Drop single-field index if compound exists
// db.movies.dropIndex({ genres: 1 });

// Or drop by name
// db.movies.dropIndex("genres_1");

// ========================================
// MONITORING INDEX PERFORMANCE
// ========================================

// Enable profiling to capture slow queries
db.setProfilingLevel(1, { slowms: 100 });  // Log queries slower than 100ms

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty();

// Disable profiling
// db.setProfilingLevel(0);

// ========================================
// OPTIMAL INDEX STRATEGY FOR THIS DATASET
// ========================================

/*
RECOMMENDED MINIMAL INDEX SET:

For movies collection:
1. { genres: 1, "imdb.rating": -1 }  - Most common query pattern
2. { directors: 1, year: -1 }         - Director queries
3. { title: 1 }                       - Title lookups
4. { title: "text", plot: "text" }    - Text search
5. { year: -1, "imdb.rating": -1 }    - Year + rating queries
6. { cast: 1 }                        - Actor queries

For theaters collection:
1. { "location.city": 1 }
2. { "screenings.time": 1 }

For users collection:
1. { username: 1 } (unique)
2. { email: 1 } (unique)
3. { total_movies_watched: -1 }

AVOID:
- Too many single-field indexes (use compound instead)
- Indexes on low-cardinality fields (e.g., boolean fields)
- Indexes that are never used (check with $indexStats)

TRADE-OFFS:
- More indexes = Faster reads, Slower writes
- Each index uses ~10-20% of collection size
- Compound indexes can replace multiple single-field indexes
*/

// ========================================
// CLEANUP: REMOVE ALL INDEXES (for testing)
// ========================================

// WARNING: This will drop ALL indexes except _id
// Use only for testing/debugging

// db.movies.dropIndexes();
// db.theaters.dropIndexes();
// db.users.dropIndexes();
