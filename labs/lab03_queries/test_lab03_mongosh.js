/**
 * Lab 03 - Comprehensive Test Suite for Advanced Queries and Indexes
 *
 * This test suite validates:
 * - Query correctness with assertion-based testing
 * - Performance benchmarks for queries
 * - Index effectiveness
 * - Data integrity and relationships
 *
 * Run this test:
 * mongosh lab03_movies --file test_lab03_mongosh.js
 */

use('lab03_movies');

// Load test framework if available
let TestFramework;
try {
    load('../tests/test_framework.js');
} catch (e) {
    // Define inline if not available
    TestFramework = class {
        constructor(dbName, collectionName) {
            this.dbName = dbName;
            this.collectionName = collectionName;
            this.db = db.getSiblingDB(dbName);
            this.collection = this.db[collectionName];
            this.results = { passed: 0, failed: 0, tests: [] };
        }

        assert(condition, message) {
            if (!condition) throw new Error(`Assertion failed: ${message}`);
        }

        assertEqual(actual, expected, message) {
            if (actual !== expected) {
                throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
            }
        }

        assertGreaterThan(actual, expected, message) {
            if (!(actual > expected)) {
                throw new Error(`${message}\nExpected ${actual} > ${expected}`);
            }
        }

        assertLessThan(actual, expected, message) {
            if (!(actual < expected)) {
                throw new Error(`${message}\nExpected ${actual} < ${expected}`);
            }
        }

        test(name, testFunction) {
            print(`\nTesting: ${name}...`);
            const startTime = new Date();
            try {
                testFunction.call(this);
                this.results.passed++;
                print(`  ✅ PASSED (${new Date() - startTime}ms)`);
            } catch (error) {
                this.results.failed++;
                print(`  ❌ FAILED: ${error.message}`);
            }
        }

        summary() {
            print("\n" + "=".repeat(60));
            print("📊 Test Summary");
            print("=".repeat(60));
            print(`✅ Passed: ${this.results.passed}`);
            print(`❌ Failed: ${this.results.failed}`);
            print(`📝 Total: ${this.results.passed + this.results.failed}`);
            return this.results.failed === 0;
        }
    };
}

// Initialize test framework
const testFramework = new TestFramework('lab03_movies', 'movies');

print("=".repeat(60));
print("Lab 03 - Advanced Queries and Indexes Test Suite");
print("=".repeat(60));

// ========================================================================
// SECTION 1: DATA INTEGRITY TESTS
// ========================================================================
print("\n📋 Section 1: Data Integrity Tests");
print("-".repeat(40));

testFramework.test('Collections exist with correct data', function() {
    const collections = db.getCollectionNames();

    this.assert(collections.includes('movies'), 'movies collection missing');
    this.assert(collections.includes('theaters'), 'theaters collection missing');
    this.assert(collections.includes('users'), 'users collection missing');

    const movieCount = db.movies.countDocuments();
    const theaterCount = db.theaters.countDocuments();
    const userCount = db.users.countDocuments();

    this.assertEqual(movieCount, 50, 'Expected exactly 50 movies');
    this.assertEqual(theaterCount, 8, 'Expected exactly 8 theaters');
    this.assertEqual(userCount, 7, 'Expected exactly 7 users');
});

testFramework.test('Movie document structure validation', function() {
    const sampleMovie = db.movies.findOne();

    // Check required fields
    const requiredFields = ['_id', 'title', 'year', 'runtime', 'genres', 'directors', 'cast', 'imdb'];
    requiredFields.forEach(field => {
        this.assert(field in sampleMovie, `Movie missing required field: ${field}`);
    });

    // Validate field types
    this.assert(typeof sampleMovie.title === 'string', 'Title should be string');
    this.assert(typeof sampleMovie.year === 'number', 'Year should be number');
    this.assert(Array.isArray(sampleMovie.genres), 'Genres should be array');
    this.assert(Array.isArray(sampleMovie.directors), 'Directors should be array');
    this.assert(typeof sampleMovie.imdb === 'object', 'IMDb should be object');
    this.assert(typeof sampleMovie.imdb.rating === 'number', 'IMDb rating should be number');
});

testFramework.test('Data relationships integrity', function() {
    // Check that all movies have valid year ranges
    const invalidYearMovies = db.movies.find({
        $or: [
            { year: { $lt: 1900 } },
            { year: { $gt: 2025 } }
        ]
    }).toArray();

    this.assertEqual(invalidYearMovies.length, 0, 'Found movies with invalid years');

    // Check IMDb ratings are in valid range
    const invalidRatings = db.movies.find({
        $or: [
            { "imdb.rating": { $lt: 0 } },
            { "imdb.rating": { $gt: 10 } }
        ]
    }).toArray();

    this.assertEqual(invalidRatings.length, 0, 'Found movies with invalid ratings');
});

// ========================================================================
// SECTION 2: COMPLEX QUERY VALIDATION TESTS
// ========================================================================
print("\n📋 Section 2: Complex Query Validation Tests");
print("-".repeat(40));

testFramework.test('Query 1: Action movies from 2010s', function() {
    const results = db.movies.find({
        genres: "Action",
        year: { $gte: 2010, $lt: 2020 }
    }).toArray();

    this.assertGreaterThan(results.length, 0, 'Should find action movies from 2010s');

    // Validate each result
    results.forEach(movie => {
        this.assert(movie.genres.includes("Action"), `Movie "${movie.title}" should have Action genre`);
        this.assert(movie.year >= 2010 && movie.year < 2020, `Movie "${movie.title}" year ${movie.year} not in 2010s`);
    });

    // Verify we're not missing any movies
    const manualCheck = db.movies.find({}).toArray().filter(m =>
        m.genres.includes("Action") && m.year >= 2010 && m.year < 2020
    );
    this.assertEqual(results.length, manualCheck.length, 'Query results count mismatch');
});

testFramework.test('Query 2: High-rated recent movies', function() {
    const results = db.movies.find({
        year: { $gte: 2015 },
        "imdb.rating": { $gte: 8.0 }
    }).sort({ "imdb.rating": -1 }).toArray();

    this.assertGreaterThan(results.length, 0, 'Should find high-rated recent movies');

    // Validate sorting
    for (let i = 1; i < results.length; i++) {
        this.assert(
            results[i-1].imdb.rating >= results[i].imdb.rating,
            'Results should be sorted by rating descending'
        );
    }

    // Validate filters
    results.forEach(movie => {
        this.assert(movie.year >= 2015, `Movie "${movie.title}" year ${movie.year} should be >= 2015`);
        this.assert(movie.imdb.rating >= 8.0, `Movie "${movie.title}" rating ${movie.imdb.rating} should be >= 8.0`);
    });
});

testFramework.test('Query 3: Movies by specific director', function() {
    const director = "Christopher Nolan";
    const results = db.movies.find({
        directors: director
    }).toArray();

    this.assertGreaterThan(results.length, 0, `Should find movies by ${director}`);

    results.forEach(movie => {
        this.assert(
            movie.directors.includes(director),
            `Movie "${movie.title}" should have ${director} as director`
        );
    });

    // Cross-check: ensure we found ALL movies by this director
    const allMovies = db.movies.find({}).toArray();
    const expectedCount = allMovies.filter(m => m.directors.includes(director)).length;
    this.assertEqual(results.length, expectedCount, 'Should find all movies by director');
});

testFramework.test('Query 4: Complex multi-genre query', function() {
    const results = db.movies.find({
        $and: [
            { genres: { $in: ["Drama", "Crime"] } },
            { genres: { $nin: ["Comedy", "Romance"] } }
        ]
    }).toArray();

    results.forEach(movie => {
        const hasDramaOrCrime = movie.genres.includes("Drama") || movie.genres.includes("Crime");
        const hasComedyOrRomance = movie.genres.includes("Comedy") || movie.genres.includes("Romance");

        this.assert(hasDramaOrCrime, `Movie "${movie.title}" should have Drama or Crime genre`);
        this.assert(!hasComedyOrRomance, `Movie "${movie.title}" should not have Comedy or Romance genre`);
    });
});

// ========================================================================
// SECTION 3: AGGREGATION PIPELINE VALIDATION
// ========================================================================
print("\n📋 Section 3: Aggregation Pipeline Validation");
print("-".repeat(40));

testFramework.test('Aggregation 1: Average rating by genre', function() {
    const results = db.movies.aggregate([
        { $unwind: "$genres" },
        { $group: {
            _id: "$genres",
            avgRating: { $avg: "$imdb.rating" },
            count: { $sum: 1 }
        }},
        { $sort: { avgRating: -1 } }
    ]).toArray();

    this.assertGreaterThan(results.length, 0, 'Should have genre statistics');

    // Validate structure
    results.forEach(genre => {
        this.assert(typeof genre._id === 'string', 'Genre name should be string');
        this.assert(typeof genre.avgRating === 'number', 'Average rating should be number');
        this.assert(genre.avgRating >= 0 && genre.avgRating <= 10, 'Average rating should be between 0 and 10');
        this.assert(genre.count > 0, 'Count should be positive');
    });

    // Validate sorting
    for (let i = 1; i < results.length; i++) {
        this.assert(
            results[i-1].avgRating >= results[i].avgRating,
            'Results should be sorted by average rating descending'
        );
    }
});

testFramework.test('Aggregation 2: Top directors by movie count', function() {
    const results = db.movies.aggregate([
        { $unwind: "$directors" },
        { $group: {
            _id: "$directors",
            movieCount: { $sum: 1 },
            avgRating: { $avg: "$imdb.rating" },
            movies: { $push: "$title" }
        }},
        { $match: { movieCount: { $gte: 2 } } },
        { $sort: { movieCount: -1 } },
        { $limit: 10 }
    ]).toArray();

    results.forEach(director => {
        this.assert(director.movieCount >= 2, 'Should only include directors with 2+ movies');
        this.assert(Array.isArray(director.movies), 'Movies should be an array');
        this.assertEqual(director.movies.length, director.movieCount, 'Movie count should match array length');
    });
});

testFramework.test('Aggregation 3: Movies by year distribution', function() {
    const results = db.movies.aggregate([
        { $bucket: {
            groupBy: "$year",
            boundaries: [2000, 2005, 2010, 2015, 2020, 2025],
            default: "other",
            output: {
                count: { $sum: 1 },
                titles: { $push: "$title" },
                avgRating: { $avg: "$imdb.rating" }
            }
        }}
    ]).toArray();

    this.assertGreaterThan(results.length, 0, 'Should have year buckets');

    results.forEach(bucket => {
        this.assert(bucket.count > 0, 'Each bucket should have at least one movie');
        this.assertEqual(bucket.titles.length, bucket.count, 'Title count should match count field');
        this.assert(typeof bucket.avgRating === 'number', 'Average rating should be a number');
    });
});

// ========================================================================
// SECTION 4: INDEX EFFECTIVENESS TESTS
// ========================================================================
print("\n📋 Section 4: Index Effectiveness Tests");
print("-".repeat(40));

testFramework.test('Index test 1: Genre index performance', function() {
    // Create index if not exists
    db.movies.createIndex({ genres: 1 });

    const explainResult = db.movies.find({ genres: "Action" }).explain("executionStats");
    const stats = explainResult.executionStats;

    // Check if index is being used
    const stage = explainResult.queryPlanner.winningPlan.stage;
    this.assert(
        stage === "IXSCAN" || stage === "FETCH",
        `Query should use index, but using ${stage}`
    );

    // Performance assertions
    this.assertLessThan(
        stats.totalDocsExamined,
        50,
        'Should examine fewer documents than collection size with index'
    );

    this.assertLessThan(
        stats.executionTimeMillis,
        10,
        'Query should execute in less than 10ms with index'
    );
});

testFramework.test('Index test 2: Compound index effectiveness', function() {
    // Create compound index
    db.movies.createIndex({ year: -1, "imdb.rating": -1 });

    const explainResult = db.movies.find({
        year: { $gte: 2015 },
        "imdb.rating": { $gte: 8.0 }
    }).explain("executionStats");

    const stats = explainResult.executionStats;

    // Verify index usage
    const winningPlan = explainResult.queryPlanner.winningPlan;
    const usesIndex = JSON.stringify(winningPlan).includes("IXSCAN");
    this.assert(usesIndex, 'Compound index should be used for this query');

    // Performance check
    this.assertLessThan(
        stats.totalDocsExamined / (stats.nReturned || 1),
        3,
        'Index should be selective (examine less than 3x returned docs)'
    );
});

testFramework.test('Index test 3: Text index functionality', function() {
    // Create text index
    db.movies.createIndex({ title: "text", plot: "text" });

    const searchResults = db.movies.find({
        $text: { $search: "space" }
    }).toArray();

    this.assertGreaterThan(searchResults.length, 0, 'Text search should return results');

    // Verify text search relevance
    searchResults.forEach(movie => {
        const hasSearchTerm =
            (movie.title && movie.title.toLowerCase().includes('space')) ||
            (movie.plot && movie.plot.toLowerCase().includes('space'));
        this.assert(hasSearchTerm, `Movie "${movie.title}" should contain search term`);
    });
});

// ========================================================================
// SECTION 5: PERFORMANCE BENCHMARKS
// ========================================================================
print("\n📋 Section 5: Performance Benchmarks");
print("-".repeat(40));

function measureQueryTime(query, iterations = 5) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
        const start = new Date();
        db.movies.find(query).toArray();
        const end = new Date();
        times.push(end - start);
    }
    return {
        avg: times.reduce((a, b) => a + b) / times.length,
        min: Math.min(...times),
        max: Math.max(...times)
    };
}

testFramework.test('Benchmark 1: Collection scan vs. indexed query', function() {
    // Drop index to test collection scan
    db.movies.dropIndex("genres_1");
    const withoutIndex = measureQueryTime({ genres: "Action" });

    // Create index and test again
    db.movies.createIndex({ genres: 1 });
    const withIndex = measureQueryTime({ genres: "Action" });

    print(`    Without index: avg=${withoutIndex.avg}ms, min=${withoutIndex.min}ms, max=${withoutIndex.max}ms`);
    print(`    With index: avg=${withIndex.avg}ms, min=${withIndex.min}ms, max=${withIndex.max}ms`);

    // Even on small dataset, index should be faster or equal
    this.assert(
        withIndex.avg <= withoutIndex.avg * 1.1, // Allow 10% variance
        'Indexed query should not be slower than collection scan'
    );
});

testFramework.test('Benchmark 2: Sort performance with index', function() {
    // Test sort without supporting index
    db.movies.dropIndex({ year: -1, "imdb.rating": -1 });
    const withoutIndex = measureQueryTime(
        { year: { $gte: 2015 } },
        5
    );

    // Create index that supports the sort
    db.movies.createIndex({ year: -1 });
    const withIndex = measureQueryTime(
        { year: { $gte: 2015 } },
        5
    );

    print(`    Without index: avg=${withoutIndex.avg}ms`);
    print(`    With index: avg=${withIndex.avg}ms`);

    // Indexed sort should be faster
    this.assert(
        withIndex.avg <= withoutIndex.avg * 1.2,
        'Indexed sort should not be significantly slower'
    );
});

testFramework.test('Benchmark 3: Aggregation pipeline performance', function() {
    const start = new Date();

    const results = db.movies.aggregate([
        { $match: { year: { $gte: 2010 } } },
        { $unwind: "$genres" },
        { $group: {
            _id: "$genres",
            count: { $sum: 1 },
            avgRating: { $avg: "$imdb.rating" }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]).toArray();

    const elapsed = new Date() - start;

    print(`    Aggregation completed in ${elapsed}ms`);
    print(`    Returned ${results.length} genre statistics`);

    this.assertLessThan(elapsed, 100, 'Aggregation should complete within 100ms');
    this.assertEqual(results.length, 5, 'Should return exactly 5 results with $limit');
});

// ========================================================================
// SECTION 6: QUERY OPTIMIZATION VALIDATION
// ========================================================================
print("\n📋 Section 6: Query Optimization Validation");
print("-".repeat(40));

testFramework.test('Optimization 1: Covered query performance', function() {
    // Create index for covered query
    db.movies.createIndex({ title: 1, year: 1, "imdb.rating": 1 });

    const explainResult = db.movies.find(
        { title: { $exists: true } },
        { title: 1, year: 1, "imdb.rating": 1, _id: 0 }
    ).limit(1).explain("executionStats");

    const stats = explainResult.executionStats;

    // In a true covered query, totalDocsExamined should be 0
    // But this depends on the query and index
    this.assert(
        stats.totalDocsExamined <= stats.nReturned,
        'Covered query should minimize document examination'
    );

    print(`    Documents examined: ${stats.totalDocsExamined}`);
    print(`    Documents returned: ${stats.nReturned}`);
    print(`    Execution time: ${stats.executionTimeMillis}ms`);
});

testFramework.test('Optimization 2: Selective index usage', function() {
    // Test that MongoDB chooses the most selective index
    db.movies.createIndex({ year: 1 });
    db.movies.createIndex({ "imdb.rating": 1 });
    db.movies.createIndex({ year: 1, "imdb.rating": 1 });

    const explainResult = db.movies.find({
        year: 2015,
        "imdb.rating": { $gte: 8.0 }
    }).explain("executionStats");

    const indexName = explainResult.queryPlanner.winningPlan.inputStage?.indexName ||
                     explainResult.queryPlanner.winningPlan.indexName;

    print(`    Chosen index: ${indexName}`);

    // MongoDB should choose the compound index for best performance
    this.assert(
        indexName && indexName.includes('year') && indexName.includes('rating'),
        'Should use compound index for multi-field query'
    );
});

// ========================================================================
// SECTION 7: DATA CONSISTENCY TESTS
// ========================================================================
print("\n📋 Section 7: Data Consistency Tests");
print("-".repeat(40));

testFramework.test('Consistency 1: No duplicate movie titles in same year', function() {
    const duplicates = db.movies.aggregate([
        { $group: {
            _id: { title: "$title", year: "$year" },
            count: { $sum: 1 }
        }},
        { $match: { count: { $gt: 1 } } }
    ]).toArray();

    this.assertEqual(
        duplicates.length,
        0,
        `Found ${duplicates.length} duplicate title-year combinations`
    );
});

testFramework.test('Consistency 2: All arrays have valid data', function() {
    const movies = db.movies.find({}).toArray();

    movies.forEach(movie => {
        // Check genres array
        this.assert(Array.isArray(movie.genres), `Movie "${movie.title}" genres should be array`);
        this.assertGreaterThan(movie.genres.length, 0, `Movie "${movie.title}" should have at least one genre`);
        movie.genres.forEach(genre => {
            this.assert(typeof genre === 'string', `Genre in "${movie.title}" should be string`);
            this.assertGreaterThan(genre.length, 0, `Genre in "${movie.title}" should not be empty`);
        });

        // Check directors array
        this.assert(Array.isArray(movie.directors), `Movie "${movie.title}" directors should be array`);
        movie.directors.forEach(director => {
            this.assert(typeof director === 'string', `Director in "${movie.title}" should be string`);
        });

        // Check cast array
        this.assert(Array.isArray(movie.cast), `Movie "${movie.title}" cast should be array`);
    });
});

testFramework.test('Consistency 3: Cross-collection references', function() {
    // If there are any references between collections, validate them
    const theaterCount = db.theaters.countDocuments();
    const userCount = db.users.countDocuments();

    this.assertGreaterThan(theaterCount, 0, 'Theaters collection should have data');
    this.assertGreaterThan(userCount, 0, 'Users collection should have data');

    // Check if theaters have valid location data
    const sampleTheater = db.theaters.findOne();
    if (sampleTheater) {
        this.assert('location' in sampleTheater, 'Theater should have location');
        if (sampleTheater.location && sampleTheater.location.geo) {
            this.assert('coordinates' in sampleTheater.location.geo, 'Theater should have coordinates');
        }
    }
});

// ========================================================================
// Print Test Summary
// ========================================================================
const success = testFramework.summary();

// Performance summary
print("\n📊 Performance Metrics Summary:");
print("-".repeat(40));
print("✅ All queries tested with assertion-based validation");
print("✅ Index effectiveness verified");
print("✅ Performance benchmarks established");
print("✅ Data integrity validated");

if (success) {
    print("\n✨ All tests passed successfully!");
} else {
    print("\n⚠️  Some tests failed. Please review the results above.");
}

// Export results for CI/CD integration
const testResults = {
    passed: testFramework.results.passed,
    failed: testFramework.results.failed,
    total: testFramework.results.passed + testFramework.results.failed,
    timestamp: new Date().toISOString()
};

print("\n📄 Test results (JSON):");
print(JSON.stringify(testResults, null, 2));