/**
 * Lab 02 - Performance Benchmarks
 *
 * This script runs performance benchmarks for all Lab 02 queries
 * to identify optimization opportunities and validate index usage.
 */

const { MongoClient } = require("mongodb");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  simple_query: 10, // Simple indexed queries should complete < 10ms
  aggregate: 50, // Aggregation queries should complete < 50ms
  complex: 100, // Complex queries should complete < 100ms
  batch: 500, // Batch operations should complete < 500ms
};

// Benchmark results storage
const benchmarkResults = [];

/**
 * Measure the execution time of a query
 * @param {string} name - Benchmark name
 * @param {Function} queryFunc - Query function to benchmark
 * @param {number} iterations - Number of iterations to run
 * @returns {Promise<Object>} Benchmark results
 */
async function benchmarkQuery(name, queryFunc, iterations = 10) {
  console.log(`\nBenchmarking: ${name}`);
  console.log("-".repeat(50));

  const times = [];
  let results = null;

  // Warm-up run
  await queryFunc();

  // Benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    results = await queryFunc();
    const end = process.hrtime.bigint();
    const timeMs = Number(end - start) / 1000000; // Convert to milliseconds
    times.push(timeMs);

    process.stdout.write(`  Run ${i + 1}/${iterations}: ${timeMs.toFixed(2)}ms\r`);
  }

  console.log(); // New line after progress

  // Calculate statistics
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];

  const result = {
    name,
    iterations,
    avgTime: avgTime.toFixed(2),
    minTime: minTime.toFixed(2),
    maxTime: maxTime.toFixed(2),
    median: median.toFixed(2),
    resultCount: Array.isArray(results) ? results.length : 1,
  };

  console.log(`  Average: ${result.avgTime}ms`);
  console.log(`  Median:  ${result.median}ms`);
  console.log(`  Min:     ${result.minTime}ms`);
  console.log(`  Max:     ${result.maxTime}ms`);
  console.log(`  Results: ${result.resultCount} documents`);

  benchmarkResults.push(result);
  return result;
}

/**
 * Analyze query execution plan
 * @param {Object} db - MongoDB database object
 * @param {Object} collection - Collection object
 * @param {Object} query - Query filter
 * @param {string} queryName - Name for display
 */
async function analyzeQueryPlan(db, collection, query, queryName) {
  console.log(`\nQuery Plan Analysis: ${queryName}`);
  console.log("-".repeat(50));

  const explainResult = await collection.find(query).explain("executionStats");

  if (explainResult.executionStats) {
    const stats = explainResult.executionStats;
    const stage = stats.executionStages?.stage || "UNKNOWN";

    console.log(`  Execution Stage: ${stage}`);
    console.log(`  Index Used: ${stage !== "COLLSCAN" ? "Yes" : "No"}`);
    console.log(`  Documents Examined: ${stats.totalDocsExamined}`);
    console.log(`  Documents Returned: ${stats.nReturned}`);
    console.log(`  Execution Time: ${stats.executionTimeMillis}ms`);

    // Calculate efficiency
    const efficiency =
      stats.nReturned > 0 ? ((stats.nReturned / stats.totalDocsExamined) * 100).toFixed(1) : "N/A";
    console.log(`  Query Efficiency: ${efficiency}%`);

    // Performance warnings
    if (stage === "COLLSCAN") {
      console.log("  ⚠️  WARNING: Collection scan detected. Consider adding an index.");
    }
    if (stats.totalDocsExamined > stats.nReturned * 10) {
      console.log("  ⚠️  WARNING: Query examining too many documents. Consider optimizing.");
    }
    if (stats.executionTimeMillis > PERFORMANCE_THRESHOLDS.simple_query) {
      console.log(
        `  ⚠️  WARNING: Query exceeds performance threshold (${PERFORMANCE_THRESHOLDS.simple_query}ms).`
      );
    }
  }
}

/**
 * Run all performance benchmarks
 */
async function runBenchmarks() {
  let client;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    console.log("=".repeat(60));
    console.log("PERFORMANCE BENCHMARK SUITE");
    console.log("=".repeat(60));

    // ========================================================================
    // Benchmark 1: Simple indexed query (customer orders)
    // ========================================================================
    await benchmarkQuery("Customer Orders Query (indexed)", async () => {
      return await db
        .collection("orders")
        .find({ customer_id: "CUST001" })
        .sort({ order_date: -1 })
        .limit(10)
        .toArray();
    });

    await analyzeQueryPlan(
      db,
      db.collection("orders"),
      { customer_id: "CUST001" },
      "Customer Orders"
    );

    // ========================================================================
    // Benchmark 2: Product category filter
    // ========================================================================
    await benchmarkQuery("Product Category Filter (indexed)", async () => {
      return await db.collection("products").find({ category: "Electronics" }).toArray();
    });

    await analyzeQueryPlan(
      db,
      db.collection("products"),
      { category: "Electronics" },
      "Product Category"
    );

    // ========================================================================
    // Benchmark 3: Complex aggregation (top products)
    // ========================================================================
    await benchmarkQuery("Top Products Aggregation", async () => {
      return await db
        .collection("orders")
        .aggregate([
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product_id",
              product_name: { $first: "$items.product_name" },
              total_quantity_sold: { $sum: "$items.quantity" },
              total_revenue: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } },
            },
          },
          { $sort: { total_revenue: -1 } },
          { $limit: 10 },
        ])
        .toArray();
    });

    // ========================================================================
    // Benchmark 4: Order lookup with embedded items
    // ========================================================================
    await benchmarkQuery("Order with Embedded Items", async () => {
      return await db.collection("orders").findOne({ order_id: "ORD001" });
    });

    // ========================================================================
    // Benchmark 5: Customer email lookup (unique index)
    // ========================================================================
    await benchmarkQuery("Customer Email Lookup (unique)", async () => {
      return await db.collection("customers").findOne({ email: "john.doe@example.com" });
    });

    await analyzeQueryPlan(
      db,
      db.collection("customers"),
      { email: "john.doe@example.com" },
      "Email Lookup"
    );

    // ========================================================================
    // Benchmark 6: Range query (products by price)
    // ========================================================================
    await benchmarkQuery("Product Price Range Query", async () => {
      return await db
        .collection("products")
        .find({ price: { $gte: 100, $lte: 500 } })
        .toArray();
    });

    // ========================================================================
    // Benchmark 7: Complex filter (multiple conditions)
    // ========================================================================
    await benchmarkQuery("Complex Product Filter", async () => {
      return await db
        .collection("products")
        .find({
          category: "Electronics",
          price: { $gte: 50, $lte: 500 },
          stock_quantity: { $gt: 0 },
        })
        .sort({ price: -1 })
        .limit(20)
        .toArray();
    });

    // ========================================================================
    // Benchmark 8: Customer order history aggregation
    // ========================================================================
    await benchmarkQuery("Customer Order Summary", async () => {
      return await db
        .collection("orders")
        .aggregate([
          { $match: { customer_id: "CUST001" } },
          {
            $group: {
              _id: "$customer_id",
              total_orders: { $sum: 1 },
              total_spent: { $sum: "$total_amount" },
              avg_order_value: { $avg: "$total_amount" },
              last_order_date: { $max: "$order_date" },
            },
          },
        ])
        .toArray();
    });

    // ========================================================================
    // Benchmark 9: Full-text search simulation
    // ========================================================================
    await benchmarkQuery("Product Name Search", async () => {
      return await db
        .collection("products")
        .find({ name: { $regex: "Phone", $options: "i" } })
        .toArray();
    });

    // ========================================================================
    // Benchmark 10: Batch insert performance
    // ========================================================================
    const testOrders = Array.from({ length: 100 }, (_, i) => ({
      order_id: `TEST_ORD_${i}`,
      customer_id: "CUST001",
      order_date: new Date(),
      total_amount: Math.random() * 1000,
      items: [
        {
          product_id: "PROD001",
          product_name: "Test Product",
          quantity: 1,
          unit_price: 100,
        },
      ],
    }));

    await benchmarkQuery(
      "Batch Insert (100 documents)",
      async () => {
        // Insert and then clean up
        const result = await db.collection("orders").insertMany(testOrders);
        await db.collection("orders").deleteMany({
          order_id: { $regex: "^TEST_ORD_" },
        });
        return result;
      },
      5 // Fewer iterations for batch operations
    );

    // ========================================================================
    // Performance Summary
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("PERFORMANCE SUMMARY");
    console.log("=".repeat(60));

    console.log(
      "\n┌─────────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┐"
    );
    console.log(
      "│ Query                                   │ Avg (ms) │ Min (ms) │ Max (ms) │ Med (ms) │"
    );
    console.log(
      "├─────────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┤"
    );

    benchmarkResults.forEach((result) => {
      const name = result.name.padEnd(40).substring(0, 40);
      const avg = result.avgTime.padStart(8);
      const min = result.minTime.padStart(8);
      const max = result.maxTime.padStart(8);
      const med = result.median.padStart(8);
      console.log(`│ ${name} │ ${avg} │ ${min} │ ${max} │ ${med} │`);
    });

    console.log(
      "└─────────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┘"
    );

    // Performance Recommendations
    console.log("\n" + "=".repeat(60));
    console.log("PERFORMANCE RECOMMENDATIONS");
    console.log("=".repeat(60));

    let recommendationCount = 0;

    benchmarkResults.forEach((result) => {
      const avgTime = parseFloat(result.avgTime);
      let threshold = PERFORMANCE_THRESHOLDS.simple_query;

      if (result.name.includes("Aggregation") || result.name.includes("Summary")) {
        threshold = PERFORMANCE_THRESHOLDS.aggregate;
      } else if (result.name.includes("Complex") || result.name.includes("Batch")) {
        threshold = PERFORMANCE_THRESHOLDS.complex;
      }

      if (avgTime > threshold) {
        recommendationCount++;
        console.log(`\n${recommendationCount}. ${result.name}:`);
        console.log(`   Current: ${avgTime}ms | Target: <${threshold}ms`);

        // Provide specific recommendations
        if (result.name.includes("Search") || result.name.includes("regex")) {
          console.log("   → Consider adding a text index for full-text search");
        } else if (result.name.includes("Range")) {
          console.log("   → Consider a compound index on filtered fields");
        } else if (result.name.includes("Aggregation")) {
          console.log("   → Consider pre-aggregating data or adding covering indexes");
        } else {
          console.log("   → Review query plan and add appropriate indexes");
        }
      }
    });

    if (recommendationCount === 0) {
      console.log("\n✓ All queries are performing within acceptable thresholds!");
    }

    // Export results to JSON
    const resultsFile = "benchmark_results.json";
    require("fs").writeFileSync(
      resultsFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          database: DATABASE_NAME,
          results: benchmarkResults,
          thresholds: PERFORMANCE_THRESHOLDS,
        },
        null,
        2
      )
    );

    console.log(`\n✓ Benchmark results exported to ${resultsFile}`);
  } catch (error) {
    console.error("\nError during benchmarking:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

// Run benchmarks
if (require.main === module) {
  console.log("Lab 02 - Performance Benchmark Suite");
  console.log("=".repeat(60));
  runBenchmarks().catch(console.error);
}

module.exports = { runBenchmarks, benchmarkQuery };
