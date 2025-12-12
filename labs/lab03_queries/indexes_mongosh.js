/**
 * Lab 03 - Index Management (mongosh version)
 *
 * Run this file in mongosh:
 * mongosh mflix --file indexes_mongosh.js
 *
 * This script creates and tests various index types
 */

use('mflix');

print("=" .repeat(60));
print("Lab 03 - MongoDB Index Management");
print("=" .repeat(60));

// ========================================================================
// 1. Single Field Indexes
// ========================================================================
print("\n1. CREATING SINGLE FIELD INDEXES");
print("-".repeat(40));

// Create index on year
db.movies.createIndex({ year: 1 });
print("✓ Created ascending index on 'year'");

// Create descending index on rating
db.movies.createIndex({ "imdb.rating": -1 });
print("✓ Created descending index on 'imdb.rating'");

// Create index on runtime
db.movies.createIndex({ runtime: 1 });
print("✓ Created ascending index on 'runtime'");

// ========================================================================
// 2. Compound Indexes
// ========================================================================
print("\n2. CREATING COMPOUND INDEXES");
print("-".repeat(40));

// Compound index for genre and year queries
db.movies.createIndex({ genres: 1, year: -1 });
print("✓ Created compound index on 'genres' (asc) and 'year' (desc)");

// Compound index for rating and year
db.movies.createIndex({ "imdb.rating": -1, year: -1 });
print("✓ Created compound index on 'imdb.rating' and 'year' (both desc)");

// Compound index for country, year, and rating
db.movies.createIndex({ countries: 1, year: -1, "imdb.rating": -1 });
print("✓ Created compound index on 'countries', 'year', 'imdb.rating'");

// ========================================================================
// 3. Multikey Indexes (for arrays)
// ========================================================================
print("\n3. CREATING MULTIKEY INDEXES");
print("-".repeat(40));

// Index on cast array
db.movies.createIndex({ cast: 1 });
print("✓ Created multikey index on 'cast' array");

// Index on directors array
db.movies.createIndex({ directors: 1 });
print("✓ Created multikey index on 'directors' array");

// Index on genres array (if not already created)
db.movies.createIndex({ genres: 1 });
print("✓ Created multikey index on 'genres' array");

// ========================================================================
// 4. Text Indexes
// ========================================================================
print("\n4. CREATING TEXT INDEXES");
print("-".repeat(40));

// Drop existing text index if any
try {
    db.movies.dropIndex("text");
} catch(e) {
    // Text index might not exist
}

// Create text index on multiple fields
db.movies.createIndex({
    title: "text",
    plot: "text",
    fullplot: "text"
}, {
    weights: {
        title: 10,
        plot: 5,
        fullplot: 1
    },
    name: "movie_text_search"
});

print("✓ Created weighted text index on 'title', 'plot', 'fullplot'");

// ========================================================================
// 5. Sparse Indexes
// ========================================================================
print("\n5. CREATING SPARSE INDEXES");
print("-".repeat(40));

// Sparse index on awards.wins (not all movies have awards)
db.movies.createIndex(
    { "awards.wins": 1 },
    { sparse: true }
);
print("✓ Created sparse index on 'awards.wins'");

// Sparse index on tomatoes ratings
db.movies.createIndex(
    { "tomatoes.viewer.rating": 1 },
    { sparse: true }
);
print("✓ Created sparse index on 'tomatoes.viewer.rating'");

// ========================================================================
// 6. Partial Indexes
// ========================================================================
print("\n6. CREATING PARTIAL INDEXES");
print("-".repeat(40));

// Partial index for high-rated movies only
db.movies.createIndex(
    { year: 1, title: 1 },
    {
        partialFilterExpression: { "imdb.rating": { $gte: 8.0 } },
        name: "high_rated_movies"
    }
);
print("✓ Created partial index for movies with rating >= 8.0");

// Partial index for recent movies
db.movies.createIndex(
    { genres: 1, "imdb.rating": -1 },
    {
        partialFilterExpression: { year: { $gte: 2000 } },
        name: "recent_movies_by_genre"
    }
);
print("✓ Created partial index for movies from year 2000+");

// ========================================================================
// 7. TTL Indexes (for sessions collection)
// ========================================================================
print("\n7. CREATING TTL INDEXES");
print("-".repeat(40));

// Check if sessions collection exists
if (db.sessions.countDocuments() > 0 || true) {
    // TTL index to expire sessions after 30 days
    db.sessions.createIndex(
        { created_at: 1 },
        { expireAfterSeconds: 2592000 } // 30 days
    );
    print("✓ Created TTL index on sessions (30-day expiration)");
} else {
    print("⊘ Skipped: sessions collection not found");
}

// ========================================================================
// 8. Unique Indexes
// ========================================================================
print("\n8. CREATING UNIQUE INDEXES");
print("-".repeat(40));

// For comments collection - ensure unique comment IDs
if (db.comments.countDocuments() > 0 || true) {
    // Create unique index on email+movie_id combination
    try {
        db.comments.createIndex(
            { email: 1, movie_id: 1, date: 1 },
            { unique: true }
        );
        print("✓ Created unique compound index on comments");
    } catch(e) {
        print("⚠ Could not create unique index (duplicates may exist)");
    }
}

// ========================================================================
// 9. Geospatial Indexes
// ========================================================================
print("\n9. CREATING GEOSPATIAL INDEXES");
print("-".repeat(40));

// 2dsphere index for theaters
if (db.theaters.countDocuments() > 0 || true) {
    db.theaters.createIndex({ "location.geo": "2dsphere" });
    print("✓ Created 2dsphere index on theaters.location.geo");
}

// ========================================================================
// 10. Index Analysis and Statistics
// ========================================================================
print("\n10. INDEX STATISTICS AND ANALYSIS");
print("-".repeat(40));

// List all indexes with their sizes
print("\nIndexes on 'movies' collection:");
const movieIndexes = db.movies.getIndexes();
movieIndexes.forEach(idx => {
    const stats = db.movies.stats({ indexDetails: true });
    print(`  • ${idx.name}:`);
    print(`    Keys: ${JSON.stringify(idx.key)}`);
    if (idx.partialFilterExpression) {
        print(`    Partial: ${JSON.stringify(idx.partialFilterExpression)}`);
    }
    if (idx.sparse) {
        print(`    Sparse: true`);
    }
});

// ========================================================================
// 11. Testing Index Performance
// ========================================================================
print("\n11. TESTING INDEX PERFORMANCE");
print("-".repeat(40));

// Test 1: Query without index (force collection scan)
print("\nTest 1: Collection Scan (no index)");
const noIndexPlan = db.movies.explain("executionStats").find({
    plot: /alien invasion/i  // Field without specific index
}).limit(10);

if (noIndexPlan.executionStats) {
    print(`  Time: ${noIndexPlan.executionStats.executionTimeMillis}ms`);
    print(`  Docs Examined: ${noIndexPlan.executionStats.totalDocsExamined}`);
    print(`  Index Used: ${noIndexPlan.executionStats.executionStages.stage}`);
}

// Test 2: Query with index
print("\nTest 2: Index Scan");
const withIndexPlan = db.movies.explain("executionStats").find({
    year: 2015  // Has index
}).limit(10);

if (withIndexPlan.executionStats) {
    print(`  Time: ${withIndexPlan.executionStats.executionTimeMillis}ms`);
    print(`  Docs Examined: ${withIndexPlan.executionStats.totalDocsExamined}`);
    print(`  Index Used: ${withIndexPlan.executionStats.executionStages.indexName || 'none'}`);
}

// Test 3: Compound index usage
print("\nTest 3: Compound Index");
const compoundPlan = db.movies.explain("executionStats").find({
    genres: "Action",
    year: { $gte: 2010 }
}).sort({ year: -1 }).limit(10);

if (compoundPlan.executionStats) {
    print(`  Time: ${compoundPlan.executionStats.executionTimeMillis}ms`);
    print(`  Docs Examined: ${compoundPlan.executionStats.totalDocsExamined}`);
    print(`  Index Used: ${compoundPlan.executionStats.executionStages.indexName || 'none'}`);
}

// Test 4: Text search
print("\nTest 4: Text Index Search");
const textPlan = db.movies.explain("executionStats").find({
    $text: { $search: "space adventure" }
}).limit(10);

if (textPlan.executionStats) {
    print(`  Time: ${textPlan.executionStats.executionTimeMillis}ms`);
    print(`  Index Used: TEXT index`);
}

// ========================================================================
// 12. Index Recommendations
// ========================================================================
print("\n12. INDEX RECOMMENDATIONS");
print("-".repeat(40));

print("\nBased on common query patterns, consider these indexes:");
print("");
print("// For filtering by multiple genres and date ranges:");
print("db.movies.createIndex({ genres: 1, released: 1 })");
print("");
print("// For user activity queries:");
print("db.comments.createIndex({ email: 1, date: -1 })");
print("");
print("// For session management:");
print("db.sessions.createIndex({ user_id: 1, last_activity: -1 })");
print("");
print("// For theater searches by location and features:");
print("db.theaters.createIndex({ 'location.address.state': 1, 'location.address.city': 1 })");

// ========================================================================
// 13. Index Maintenance Commands
// ========================================================================
print("\n13. INDEX MAINTENANCE COMMANDS");
print("-".repeat(40));

print("\nUseful index management commands:");
print("");
print("// View index usage statistics:");
print("db.movies.aggregate([{ $indexStats: {} }])");
print("");
print("// Rebuild all indexes:");
print("db.movies.reIndex()");
print("");
print("// Drop specific index:");
print("db.movies.dropIndex('index_name')");
print("");
print("// Get index size:");
print("db.movies.totalIndexSize()");
print("");
print("// Validate indexes:");
print("db.movies.validate({ full: true })");

// ========================================================================
// Summary
// ========================================================================
print("\n" + "=".repeat(60));
print("INDEX CREATION SUMMARY");
print("=".repeat(60));

const collections = ["movies", "comments", "theaters", "sessions", "users"];
let totalIndexes = 0;

collections.forEach(coll => {
    const indexes = db[coll].getIndexes();
    if (indexes.length > 0) {
        print(`\n${coll}: ${indexes.length} indexes`);
        totalIndexes += indexes.length;
    }
});

print(`\nTotal indexes created: ${totalIndexes}`);
print("\n✓ Index setup completed successfully!");
print("=".repeat(60));