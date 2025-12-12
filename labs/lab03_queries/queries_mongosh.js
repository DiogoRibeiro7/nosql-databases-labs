/**
 * Lab 03 - Advanced Queries (mongosh version)
 *
 * Run this file in mongosh:
 * mongosh mflix --file queries_mongosh.js
 *
 * Or copy and paste individual queries into mongosh
 */

// Switch to the correct database
use('mflix');

print("=" .repeat(60));
print("Lab 03 - Advanced MongoDB Queries");
print("=" .repeat(60));

// ========================================================================
// Query 1: Find movies by genre and year range
// ========================================================================
print("\n1. MOVIES BY GENRE AND YEAR");
print("-".repeat(40));

const genreYearMovies = db.movies.find({
    genres: "Sci-Fi",
    year: { $gte: 2010, $lte: 2020 }
}).sort({ "imdb.rating": -1 }).limit(5).toArray();

print("Top Sci-Fi movies (2010-2020):");
genreYearMovies.forEach(movie => {
    print(`  ${movie.title} (${movie.year}) - Rating: ${movie.imdb?.rating || 'N/A'}`);
});

// ========================================================================
// Query 2: Complex text search with score
// ========================================================================
print("\n2. TEXT SEARCH WITH RELEVANCE");
print("-".repeat(40));

// Ensure text index exists
db.movies.createIndex({ title: "text", plot: "text", fullplot: "text" });

const textSearchResults = db.movies.find(
    { $text: { $search: "space alien robot" } },
    { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } }).limit(5).toArray();

print("Movies matching 'space alien robot':");
textSearchResults.forEach(movie => {
    print(`  ${movie.title} (${movie.year})`);
    print(`    Relevance Score: ${movie.score.toFixed(2)}`);
});

// ========================================================================
// Query 3: Find movies with multiple conditions using $and, $or
// ========================================================================
print("\n3. COMPLEX LOGICAL CONDITIONS");
print("-".repeat(40));

const complexLogicalQuery = db.movies.find({
    $and: [
        { year: { $gte: 2000 } },
        { $or: [
            { "imdb.rating": { $gte: 9.0 } },
            { "awards.wins": { $gte: 50 } }
        ]},
        { runtime: { $lte: 180 } }
    ]
}).limit(5).toArray();

print("Recent movies that are either highly rated OR highly awarded:");
complexLogicalQuery.forEach(movie => {
    print(`  ${movie.title} (${movie.year})`);
    print(`    Rating: ${movie.imdb?.rating || 'N/A'}, Awards: ${movie.awards?.wins || 0}`);
});

// ========================================================================
// Query 4: Array operations - $elemMatch, $size
// ========================================================================
print("\n4. ARRAY OPERATIONS");
print("-".repeat(40));

// Find movies where a specific actor appears in first 3 cast positions
const leadActorMovies = db.movies.find({
    cast: { $elemMatch: { $eq: "Leonardo DiCaprio" } }
}).limit(5).toArray();

print("Movies with Leonardo DiCaprio:");
leadActorMovies.forEach(movie => {
    const position = movie.cast?.indexOf("Leonardo DiCaprio") + 1;
    print(`  ${movie.title} (${movie.year}) - Position #${position} in cast`);
});

// Find movies with exactly 3 directors
const threeDirectorMovies = db.movies.find({
    directors: { $size: 3 }
}).limit(3).toArray();

print("\nMovies with exactly 3 directors:");
threeDirectorMovies.forEach(movie => {
    print(`  ${movie.title}: ${movie.directors.join(", ")}`);
});

// ========================================================================
// Query 5: Regex patterns for flexible matching
// ========================================================================
print("\n5. REGEX PATTERN MATCHING");
print("-".repeat(40));

// Find movies with titles starting with "The" and ending with numbers
const regexMovies = db.movies.find({
    title: { $regex: /^The.*\d+$/, $options: "i" }
}).limit(5).toArray();

print("Movies matching pattern '^The.*[0-9]+$':");
regexMovies.forEach(movie => {
    print(`  ${movie.title} (${movie.year})`);
});

// ========================================================================
// Query 6: Working with embedded documents
// ========================================================================
print("\n6. EMBEDDED DOCUMENT QUERIES");
print("-".repeat(40));

// Find movies with specific tomatoes ratings
const tomatoesQuery = db.movies.find({
    "tomatoes.viewer.rating": { $gte: 4.5 },
    "tomatoes.critic.rating": { $gte: 8.0 }
}).limit(5).toArray();

print("Highly rated on Rotten Tomatoes (both critics and viewers):");
tomatoesQuery.forEach(movie => {
    print(`  ${movie.title} (${movie.year})`);
    if (movie.tomatoes) {
        print(`    Critic: ${movie.tomatoes.critic?.rating || 'N/A'}/10`);
        print(`    Viewer: ${movie.tomatoes.viewer?.rating || 'N/A'}/5`);
    }
});

// ========================================================================
// Query 7: Geospatial queries (if theater data available)
// ========================================================================
print("\n7. GEOSPATIAL QUERIES");
print("-".repeat(40));

// Check if theaters collection exists and has location data
const theaterCount = db.theaters.countDocuments();

if (theaterCount > 0) {
    // Ensure 2dsphere index
    db.theaters.createIndex({ "location.geo": "2dsphere" });

    // Find theaters near a point (e.g., San Francisco)
    const nearbyTheaters = db.theaters.find({
        "location.geo": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [-122.4194, 37.7749] // San Francisco coordinates
                },
                $maxDistance: 50000 // 50km
            }
        }
    }).limit(5).toArray();

    print("Theaters near San Francisco:");
    nearbyTheaters.forEach(theater => {
        print(`  ${theater.name} - ${theater.location.address.city}, ${theater.location.address.state}`);
    });
} else {
    print("No theater data available for geospatial queries");
}

// ========================================================================
// Query 8: Date operations
// ========================================================================
print("\n8. DATE OPERATIONS");
print("-".repeat(40));

// Find movies released in the last N years
const currentYear = new Date().getFullYear();
const recentMovies = db.movies.find({
    year: { $gte: currentYear - 5 }
}).sort({ year: -1 }).limit(5).toArray();

print(`Movies from the last 5 years (${currentYear - 5}-${currentYear}):`);
recentMovies.forEach(movie => {
    print(`  ${movie.title} (${movie.year})`);
});

// Find movies with recent comments
const moviesWithRecentComments = db.movies.aggregate([
    {
        $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "movie_id",
            as: "recent_comments"
        }
    },
    {
        $match: {
            "recent_comments": { $ne: [] }
        }
    },
    {
        $project: {
            title: 1,
            year: 1,
            comment_count: { $size: "$recent_comments" }
        }
    },
    { $sort: { comment_count: -1 } },
    { $limit: 5 }
]).toArray();

print("\nMovies with most comments:");
moviesWithRecentComments.forEach(movie => {
    print(`  ${movie.title} (${movie.year}) - ${movie.comment_count} comments`);
});

// ========================================================================
// Query 9: Aggregation with $lookup (JOIN)
// ========================================================================
print("\n9. JOIN OPERATIONS WITH $LOOKUP");
print("-".repeat(40));

// Find movies with their comments and user information
const moviesWithComments = db.movies.aggregate([
    { $match: { year: 2015 } },
    { $limit: 3 },
    {
        $lookup: {
            from: "comments",
            let: { movie_id: "$_id" },
            pipeline: [
                { $match: { $expr: { $eq: ["$movie_id", "$$movie_id"] } } },
                { $limit: 2 },
                { $project: { name: 1, email: 1, text: 1, date: 1 } }
            ],
            as: "comments"
        }
    },
    {
        $project: {
            title: 1,
            year: 1,
            "imdb.rating": 1,
            comments: 1
        }
    }
]).toArray();

print("Movies with their comments:");
moviesWithComments.forEach(movie => {
    print(`\n${movie.title} (${movie.year}) - Rating: ${movie.imdb?.rating || 'N/A'}`);
    if (movie.comments.length > 0) {
        print("  Recent Comments:");
        movie.comments.forEach(comment => {
            print(`    - ${comment.name}: "${comment.text.substring(0, 50)}..."`);
        });
    } else {
        print("  No comments");
    }
});

// ========================================================================
// Query 10: Update operations examples
// ========================================================================
print("\n10. UPDATE OPERATIONS");
print("-".repeat(40));

// Example: Update a movie's viewer count (dry run - not actually executing)
print("Example update commands (not executed):");
print("");
print("// Increment view count:");
print('db.movies.updateOne(');
print('  { title: "The Matrix" },');
print('  { $inc: { views: 1 } }');
print(');');
print("");
print("// Add a new genre to a movie:");
print('db.movies.updateOne(');
print('  { title: "Inception" },');
print('  { $addToSet: { genres: "Mind-bending" } }');
print(');');
print("");
print("// Update multiple fields:");
print('db.movies.updateMany(');
print('  { year: { $lt: 1950 } },');
print('  { $set: { era: "Classic" } }');
print(');');

// ========================================================================
// Query 11: Aggregation - Group and statistical operations
// ========================================================================
print("\n11. STATISTICAL AGGREGATIONS");
print("-".repeat(40));

const genreStats = db.movies.aggregate([
    { $unwind: "$genres" },
    { $group: {
        _id: "$genres",
        count: { $sum: 1 },
        avgRating: { $avg: "$imdb.rating" },
        minYear: { $min: "$year" },
        maxYear: { $max: "$year" },
        totalRuntime: { $sum: "$runtime" }
    }},
    { $sort: { count: -1 } },
    { $limit: 5 }
]).toArray();

print("Genre Statistics (Top 5):");
genreStats.forEach(genre => {
    print(`\n${genre._id}:`);
    print(`  Movies: ${genre.count}`);
    print(`  Avg Rating: ${genre.avgRating?.toFixed(2) || 'N/A'}`);
    print(`  Year Range: ${genre.minYear}-${genre.maxYear}`);
    print(`  Total Runtime: ${Math.floor(genre.totalRuntime / 60)} hours`);
});

// ========================================================================
// Query 12: Performance analysis
// ========================================================================
print("\n12. QUERY PERFORMANCE ANALYSIS");
print("-".repeat(40));

// Analyze a query's execution plan
const explainOutput = db.movies.explain("executionStats").find({
    genres: "Action",
    year: { $gte: 2010 }
}).limit(10);

if (explainOutput.executionStats) {
    print("Query Performance for Action movies (2010+):");
    print(`  Execution Time: ${explainOutput.executionStats.executionTimeMillis}ms`);
    print(`  Documents Examined: ${explainOutput.executionStats.totalDocsExamined}`);
    print(`  Documents Returned: ${explainOutput.executionStats.nReturned}`);
    print(`  Efficiency: ${(explainOutput.executionStats.nReturned / explainOutput.executionStats.totalDocsExamined * 100).toFixed(1)}%`);

    // Check if index was used
    const stage = explainOutput.executionStats.executionStages;
    if (stage.stage === "COLLSCAN") {
        print("  ⚠ Warning: Collection scan - consider adding index");
    } else {
        print("  ✓ Index scan used");
    }
}

// List available indexes
print("\nAvailable Indexes on movies collection:");
const indexes = db.movies.getIndexes();
indexes.forEach(idx => {
    print(`  ${idx.name}: ${JSON.stringify(idx.key)}`);
});

print("\n" + "=".repeat(60));
print("✓ All queries completed successfully!");
print("=".repeat(60));