/**
 * Lab 03 - Performance Benchmark Test Suite
 *
 * This test suite focuses on performance benchmarking and optimization validation.
 * It measures query performance with and without indexes, tracks execution times,
 * and validates that optimizations meet expected performance targets.
 *
 * Run: node test_lab03_performance.js
 */

const { MongoClient } = require("mongodb");

// Configuration
const config = {
  uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  database: "lab03_movies",
  iterations: 10, // Number of iterations for each benchmark
  warmupIterations: 3, // Warmup runs before measurement
  maxAcceptableTime: {
    indexed: 5, // Max acceptable time for indexed queries (ms)
    unindexed: 50, // Max acceptable time for unindexed queries (ms)
    aggregation: 100, // Max acceptable time for aggregation (ms)
  },
};

class PerformanceTester {
  constructor() {
    this.results = {
      benchmarks: [],
      passed: 0,
      failed: 0,
      totalTime: 0,
    };
  }

  async connect() {
    this.client = new MongoClient(config.uri);
    await this.client.connect();
    this.db = this.client.db(config.database);
    this.movies = this.db.collection("movies");
    console.log("✅ Connected to MongoDB");
  }

  async disconnect() {
    await this.client.close();
    console.log("✅ Disconnected from MongoDB");
  }

  /**
   * Measure query execution time with statistics
   */
  async measureQuery(name, queryFn, options = {}) {
    const iterations = options.iterations || config.iterations;
    const warmup = options.warmup || config.warmupIterations;

    // Warmup runs
    for (let i = 0; i < warmup; i++) {
      await queryFn();
    }

    // Actual measurements
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await queryFn();
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      times.push(duration);
    }

    // Calculate statistics
    const stats = {
      name,
      iterations,
      times,
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: this.calculateMedian(times),
      stdDev: this.calculateStdDev(times),
      p95: this.calculatePercentile(times, 95),
      p99: this.calculatePercentile(times, 99),
    };

    return stats;
  }

  calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateStdDev(arr) {
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squareDiffs = arr.map((value) => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(avgSquareDiff);
  }

  calculatePercentile(arr, percentile) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Run a benchmark test
   */
  async benchmark(name, setupFn, testFn, teardownFn, expectedMax) {
    console.log(`\n📊 Benchmark: ${name}`);
    console.log("-".repeat(60));

    try {
      // Setup
      if (setupFn) {
        await setupFn();
        console.log("  ✓ Setup completed");
      }

      // Run benchmark
      const stats = await this.measureQuery(name, testFn);

      // Display results
      console.log(`  📈 Results (${stats.iterations} iterations):`);
      console.log(`     Min: ${stats.min.toFixed(2)}ms`);
      console.log(`     Max: ${stats.max.toFixed(2)}ms`);
      console.log(`     Avg: ${stats.avg.toFixed(2)}ms`);
      console.log(`     Median: ${stats.median.toFixed(2)}ms`);
      console.log(`     Std Dev: ${stats.stdDev.toFixed(2)}ms`);
      console.log(`     P95: ${stats.p95.toFixed(2)}ms`);
      console.log(`     P99: ${stats.p99.toFixed(2)}ms`);

      // Validate performance
      if (expectedMax && stats.median > expectedMax) {
        console.log(
          `  ❌ FAILED: Median time ${stats.median.toFixed(2)}ms exceeds threshold ${expectedMax}ms`
        );
        this.results.failed++;
        stats.passed = false;
      } else {
        console.log(`  ✅ PASSED: Performance within acceptable range`);
        this.results.passed++;
        stats.passed = true;
      }

      // Store results
      this.results.benchmarks.push(stats);
      this.results.totalTime += stats.avg * stats.iterations;

      // Teardown
      if (teardownFn) {
        await teardownFn();
        console.log("  ✓ Teardown completed");
      }

      return stats;
    } catch (error) {
      console.error(`  ❌ Benchmark failed: ${error.message}`);
      this.results.failed++;
      return null;
    }
  }

  /**
   * Compare two benchmark results
   */
  compareBenchmarks(baseline, optimized) {
    const improvement = ((baseline.avg - optimized.avg) / baseline.avg) * 100;
    const speedup = baseline.avg / optimized.avg;

    console.log("\n📊 Performance Comparison:");
    console.log("-".repeat(60));
    console.log(`  Baseline avg: ${baseline.avg.toFixed(2)}ms`);
    console.log(`  Optimized avg: ${optimized.avg.toFixed(2)}ms`);
    console.log(`  Improvement: ${improvement.toFixed(1)}%`);
    console.log(`  Speedup: ${speedup.toFixed(2)}x`);

    if (improvement > 0) {
      console.log(`  ✅ Optimization successful!`);
    } else {
      console.log(`  ⚠️ No performance improvement detected`);
    }

    return { improvement, speedup };
  }

  /**
   * Generate detailed performance report
   */
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 PERFORMANCE TEST SUMMARY");
    console.log("=".repeat(60));

    console.log(`\n✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏱️  Total test time: ${(this.results.totalTime / 1000).toFixed(2)}s`);

    console.log("\n📈 Benchmark Results:");
    console.log("-".repeat(60));

    const table = this.results.benchmarks.map((b) => ({
      Test: b.name.substring(0, 30),
      "Avg (ms)": b.avg.toFixed(2),
      "P95 (ms)": b.p95.toFixed(2),
      Status: b.passed ? "✅" : "❌",
    }));

    console.table(table);

    // Performance insights
    console.log("\n💡 Performance Insights:");
    console.log("-".repeat(60));

    const fastestQuery = this.results.benchmarks.reduce((min, b) => (b.avg < min.avg ? b : min));
    const slowestQuery = this.results.benchmarks.reduce((max, b) => (b.avg > max.avg ? b : max));

    console.log(`  Fastest query: ${fastestQuery.name} (${fastestQuery.avg.toFixed(2)}ms avg)`);
    console.log(`  Slowest query: ${slowestQuery.name} (${slowestQuery.avg.toFixed(2)}ms avg)`);

    return this.results;
  }
}

// Main test execution
async function runPerformanceTests() {
  const tester = new PerformanceTester();

  try {
    await tester.connect();

    console.log("\n" + "=".repeat(60));
    console.log("🚀 Lab 03 - Performance Benchmark Suite");
    console.log("=".repeat(60));

    // ================================================================
    // Test 1: Simple Query - With and Without Index
    // ================================================================
    const genreQueryBaseline = await tester.benchmark(
      "Genre Query (No Index)",
      async () => {
        await tester.movies.dropIndex("genres_1").catch(() => {});
      },
      async () => {
        await tester.movies.find({ genres: "Action" }).toArray();
      },
      null,
      config.maxAcceptableTime.unindexed
    );

    const genreQueryOptimized = await tester.benchmark(
      "Genre Query (With Index)",
      async () => {
        await tester.movies.createIndex({ genres: 1 });
      },
      async () => {
        await tester.movies.find({ genres: "Action" }).toArray();
      },
      null,
      config.maxAcceptableTime.indexed
    );

    if (genreQueryBaseline && genreQueryOptimized) {
      tester.compareBenchmarks(genreQueryBaseline, genreQueryOptimized);
    }

    // ================================================================
    // Test 2: Compound Query - With and Without Index
    // ================================================================
    const compoundQueryBaseline = await tester.benchmark(
      "Compound Query (No Index)",
      async () => {
        await tester.movies.dropIndex("year_-1_imdb.rating_-1").catch(() => {});
      },
      async () => {
        await tester.movies
          .find({
            year: { $gte: 2015 },
            "imdb.rating": { $gte: 8.0 },
          })
          .sort({ "imdb.rating": -1 })
          .toArray();
      },
      null,
      config.maxAcceptableTime.unindexed
    );

    const compoundQueryOptimized = await tester.benchmark(
      "Compound Query (With Index)",
      async () => {
        await tester.movies.createIndex({ year: -1, "imdb.rating": -1 });
      },
      async () => {
        await tester.movies
          .find({
            year: { $gte: 2015 },
            "imdb.rating": { $gte: 8.0 },
          })
          .sort({ "imdb.rating": -1 })
          .toArray();
      },
      null,
      config.maxAcceptableTime.indexed
    );

    if (compoundQueryBaseline && compoundQueryOptimized) {
      tester.compareBenchmarks(compoundQueryBaseline, compoundQueryOptimized);
    }

    // ================================================================
    // Test 3: Text Search Performance
    // ================================================================
    await tester.benchmark(
      "Text Search Query",
      async () => {
        await tester.movies.createIndex({ title: "text", plot: "text" });
      },
      async () => {
        await tester.movies.find({ $text: { $search: "space war" } }).toArray();
      },
      null,
      config.maxAcceptableTime.indexed * 2 // Text search is typically slower
    );

    // ================================================================
    // Test 4: Aggregation Pipeline Performance
    // ================================================================
    await tester.benchmark(
      "Aggregation - Genre Statistics",
      null,
      async () => {
        await tester.movies
          .aggregate([
            { $unwind: "$genres" },
            {
              $group: {
                _id: "$genres",
                avgRating: { $avg: "$imdb.rating" },
                count: { $sum: 1 },
              },
            },
            { $sort: { avgRating: -1 } },
          ])
          .toArray();
      },
      null,
      config.maxAcceptableTime.aggregation
    );

    await tester.benchmark(
      "Aggregation - Optimized with $match",
      null,
      async () => {
        await tester.movies
          .aggregate([
            { $match: { year: { $gte: 2010 } } }, // Filter early
            { $unwind: "$genres" },
            {
              $group: {
                _id: "$genres",
                avgRating: { $avg: "$imdb.rating" },
                count: { $sum: 1 },
              },
            },
            { $sort: { avgRating: -1 } },
          ])
          .toArray();
      },
      null,
      config.maxAcceptableTime.aggregation / 2
    );

    // ================================================================
    // Test 5: Covered Query Performance
    // ================================================================
    await tester.benchmark(
      "Non-Covered Query",
      async () => {
        await tester.movies.createIndex({ title: 1, year: 1 });
      },
      async () => {
        await tester.movies
          .find(
            { title: { $exists: true } },
            { title: 1, year: 1, plot: 1 } // plot not in index
          )
          .limit(10)
          .toArray();
      },
      null,
      config.maxAcceptableTime.indexed
    );

    await tester.benchmark(
      "Covered Query",
      async () => {
        await tester.movies.createIndex({ title: 1, year: 1 });
      },
      async () => {
        await tester.movies
          .find(
            { title: { $exists: true } },
            { title: 1, year: 1, _id: 0 } // All fields in index
          )
          .limit(10)
          .toArray();
      },
      null,
      config.maxAcceptableTime.indexed / 2
    );

    // ================================================================
    // Test 6: Sort Performance
    // ================================================================
    await tester.benchmark(
      "Sort without Index",
      async () => {
        await tester.movies.dropIndex("imdb.rating_-1").catch(() => {});
      },
      async () => {
        await tester.movies.find({}).sort({ "imdb.rating": -1 }).limit(10).toArray();
      },
      null,
      config.maxAcceptableTime.unindexed
    );

    await tester.benchmark(
      "Sort with Index",
      async () => {
        await tester.movies.createIndex({ "imdb.rating": -1 });
      },
      async () => {
        await tester.movies.find({}).sort({ "imdb.rating": -1 }).limit(10).toArray();
      },
      null,
      config.maxAcceptableTime.indexed
    );

    // ================================================================
    // Test 7: Query Selectivity
    // ================================================================
    await tester.benchmark(
      "High Selectivity Query",
      async () => {
        await tester.movies.createIndex({ _id: 1 });
      },
      async () => {
        const id = await tester.movies.findOne({}, { _id: 1 });
        await tester.movies.find({ _id: id._id }).toArray();
      },
      null,
      2 // Very fast for single document
    );

    await tester.benchmark(
      "Low Selectivity Query",
      async () => {
        await tester.movies.createIndex({ year: 1 });
      },
      async () => {
        await tester.movies.find({ year: { $exists: true } }).toArray();
      },
      null,
      config.maxAcceptableTime.unindexed
    );

    // ================================================================
    // Test 8: Index Intersection
    // ================================================================
    await tester.benchmark(
      "Multiple Single Indexes",
      async () => {
        await tester.movies.createIndex({ year: 1 });
        await tester.movies.createIndex({ "imdb.rating": 1 });
      },
      async () => {
        await tester.movies
          .find({
            year: 2015,
            "imdb.rating": { $gte: 8.0 },
          })
          .toArray();
      },
      null,
      config.maxAcceptableTime.indexed
    );

    // ================================================================
    // Test 9: Regex Performance
    // ================================================================
    await tester.benchmark(
      "Regex Query (No Index)",
      async () => {
        await tester.movies.dropIndex("title_1").catch(() => {});
      },
      async () => {
        await tester.movies
          .find({
            title: /^The/i,
          })
          .toArray();
      },
      null,
      config.maxAcceptableTime.unindexed
    );

    await tester.benchmark(
      "Regex Query (With Index)",
      async () => {
        await tester.movies.createIndex({ title: 1 });
      },
      async () => {
        await tester.movies
          .find({
            title: /^The/,
          })
          .toArray(); // Case-sensitive for index usage
      },
      null,
      config.maxAcceptableTime.indexed * 2
    );

    // ================================================================
    // Test 10: Bulk Operations
    // ================================================================
    await tester.benchmark(
      "Bulk Read Operations",
      null,
      async () => {
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(tester.movies.find({ year: 2010 + i }).toArray());
        }
        await Promise.all(promises);
      },
      null,
      config.maxAcceptableTime.indexed * 10
    );

    // Generate final report
    const report = tester.generateReport();

    // Export results for CI/CD
    console.log("\n📄 Results for CI/CD (JSON):");
    console.log(
      JSON.stringify(
        {
          passed: report.passed,
          failed: report.failed,
          totalBenchmarks: report.benchmarks.length,
          averageTime:
            report.benchmarks.reduce((sum, b) => sum + b.avg, 0) / report.benchmarks.length,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  } finally {
    await tester.disconnect();
  }
}

// Run tests if executed directly
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { PerformanceTester, runPerformanceTests };
