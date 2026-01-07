/**
 * Lab 02 - Performance Benchmarks (mongosh version)
 *
 * Run this file in mongosh:
 *   mongosh lab02_ecommerce --file benchmarks_mongosh.js
 *
 * Or explicitly:
 *   mongosh "mongodb://localhost:27017/lab02_ecommerce" --file benchmarks_mongosh.js
 *
 * Notes (mongosh constraints vs Node):
 * - No MongoClient / process.hrtime / fs / require("fs") / process.env in mongosh.
 * - Timing uses Date.now() (ms resolution). Good enough for labs.
 * - Export is printed as JSON to stdout so you can redirect:
 *     mongosh lab02_ecommerce --file benchmarks_mongosh.js > benchmark_results.json
 */

// Switch to the correct database
use("lab02_ecommerce");

print("=".repeat(60));
print("Lab 02 - Performance Benchmark Suite (mongosh)");
print("=".repeat(60));

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  simple_query: 10,
  aggregate: 50,
  complex: 100,
  batch: 500,
};

// Benchmark results storage (in-memory)
const benchmarkResults = [];

/**
 * Compute median of numeric array (non-mutating).
 * @param {number[]} xs
 * @returns {number}
 */
function median(xs) {
  const a = xs.slice().sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a[mid];
}

/**
 * Measure execution time of a query function (mongosh).
 *
 * @param {string} name
 * @param {Function} queryFunc - function that executes the query and returns results
 * @param {number} iterations
 * @returns {object} result summary
 */
function benchmarkQuery(name, queryFunc, iterations = 10) {
  print(`\nBenchmarking: ${name}`);
  print("-".repeat(50));

  const times = [];
  let results = null;

  // Warm-up run
  queryFunc();

  // Benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    results = queryFunc();
    const end = Date.now();
    const timeMs = end - start;

    times.push(timeMs);
    print(`  Run ${i + 1}/${iterations}: ${timeMs}ms`);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const med = median(times);

  const result = {
    name,
    iterations,
    avgTime: Number(avgTime.toFixed(2)),
    minTime: Number(minTime.toFixed(2)),
    maxTime: Number(maxTime.toFixed(2)),
    median: Number(med.toFixed(2)),
    resultCount: Array.isArray(results) ? results.length : results ? 1 : 0,
  };

  print(`  Average: ${result.avgTime}ms`);
  print(`  Median:  ${result.median}ms`);
  print(`  Min:     ${result.minTime}ms`);
  print(`  Max:     ${result.maxTime}ms`);
  print(`  Results: ${result.resultCount} document(s)`);

  benchmarkResults.push(result);
  return result;
}

/**
 * Analyze query plan using explain("executionStats") (mongosh).
 *
 * @param {string} collName
 * @param {object} query
 * @param {string} queryName
 */
function analyzeQueryPlan(collName, query, queryName) {
  print(`\nQuery Plan Analysis: ${queryName}`);
  print("-".repeat(50));

  const explainResult = db.getCollection(collName).find(query).explain("executionStats");

  if (!explainResult || !explainResult.executionStats) {
    print("  No executionStats available.");
    return;
  }

  const stats = explainResult.executionStats;

  // Try to find whether COLLSCAN appears anywhere in the winning plan.
  // executionStages.stage can be FETCH/IXSCAN/etc, so we also scan the plan json.
  const stageTop =
    stats.executionStages && stats.executionStages.stage ? stats.executionStages.stage : "UNKNOWN";
  const planStr = JSON.stringify(explainResult.queryPlanner || {});
  const usedCollscan = planStr.includes("COLLSCAN");

  print(`  Execution Stage (top): ${stageTop}`);
  print(`  Index Used: ${usedCollscan ? "No (COLLSCAN)" : "Likely Yes"}`);
  print(`  Documents Examined: ${stats.totalDocsExamined}`);
  print(`  Documents Returned: ${stats.nReturned}`);
  print(`  Execution Time: ${stats.executionTimeMillis}ms`);

  const efficiency =
    stats.nReturned > 0 ? ((stats.nReturned / stats.totalDocsExamined) * 100).toFixed(1) : "N/A";
  print(`  Query Efficiency: ${efficiency}%`);

  if (usedCollscan) {
    print("  ⚠ WARNING: Collection scan detected. Consider adding an index.");
  }
  if (stats.totalDocsExamined > stats.nReturned * 10 && stats.nReturned > 0) {
    print("  ⚠ WARNING: Query examining too many documents. Consider optimizing.");
  }
  if (stats.executionTimeMillis > PERFORMANCE_THRESHOLDS.simple_query) {
    print(
      `  ⚠ WARNING: Query exceeds performance threshold (${PERFORMANCE_THRESHOLDS.simple_query}ms).`
    );
  }
}

/**
 * Helper for recommendation thresholds by benchmark name.
 * @param {string} name
 * @returns {number}
 */
function thresholdFor(name) {
  if (name.includes("Aggregation") || name.includes("Summary"))
    return PERFORMANCE_THRESHOLDS.aggregate;
  if (name.includes("Batch")) return PERFORMANCE_THRESHOLDS.batch;
  if (name.includes("Complex")) return PERFORMANCE_THRESHOLDS.complex;
  return PERFORMANCE_THRESHOLDS.simple_query;
}

// ========================================================================
// BENCHMARK SUITE
// ========================================================================
print("\n" + "=".repeat(60));
print("PERFORMANCE BENCHMARK SUITE");
print("=".repeat(60));

// Benchmark 1: Simple indexed query (customer orders)
benchmarkQuery("Customer Orders Query (indexed)", () => {
  return db.orders.find({ customer_id: "CUST001" }).sort({ order_date: -1 }).limit(10).toArray();
});
analyzeQueryPlan("orders", { customer_id: "CUST001" }, "Customer Orders");

// Benchmark 2: Product category filter
benchmarkQuery("Product Category Filter (indexed)", () => {
  return db.products.find({ category: "Electronics" }).toArray();
});
analyzeQueryPlan("products", { category: "Electronics" }, "Product Category");

// Benchmark 3: Complex aggregation (top products)
benchmarkQuery("Top Products Aggregation", () => {
  return db.orders
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

// Benchmark 4: Order lookup with embedded items
benchmarkQuery("Order with Embedded Items", () => {
  return db.orders.findOne({ order_id: "ORD001" });
});

// Benchmark 5: Customer email lookup (unique index)
benchmarkQuery("Customer Email Lookup (unique)", () => {
  return db.customers.findOne({ email: "john.doe@example.com" });
});
analyzeQueryPlan("customers", { email: "john.doe@example.com" }, "Email Lookup");

// Benchmark 6: Range query (products by price)
benchmarkQuery("Product Price Range Query", () => {
  return db.products.find({ price: { $gte: 100, $lte: 500 } }).toArray();
});

// Benchmark 7: Complex filter (multiple conditions)
benchmarkQuery("Complex Product Filter", () => {
  return db.products
    .find({
      category: "Electronics",
      price: { $gte: 50, $lte: 500 },
      stock_quantity: { $gt: 0 },
    })
    .sort({ price: -1 })
    .limit(20)
    .toArray();
});

// Benchmark 8: Customer order history aggregation
benchmarkQuery("Customer Order Summary", () => {
  return db.orders
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

// Benchmark 9: Product name search (regex simulation)
benchmarkQuery("Product Name Search", () => {
  return db.products.find({ name: { $regex: "Phone", $options: "i" } }).toArray();
});

// Benchmark 10: Batch insert performance (100 docs; 5 iterations)
const testOrders = Array.from({ length: 100 }, (_, i) => ({
  order_id: `TEST_ORD_${i}`,
  customer_id: "CUST001",
  order_date: new Date(),
  total_amount: Math.random() * 1000,
  items: [{ product_id: "PROD001", product_name: "Test Product", quantity: 1, unit_price: 100 }],
}));

benchmarkQuery(
  "Batch Insert (100 documents)",
  () => {
    const result = db.orders.insertMany(testOrders);
    db.orders.deleteMany({ order_id: { $regex: "^TEST_ORD_" } });
    return result;
  },
  5
);

// ========================================================================
// PERFORMANCE SUMMARY
// ========================================================================
print("\n" + "=".repeat(60));
print("PERFORMANCE SUMMARY");
print("=".repeat(60));

print("\n┌─────────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┐");
print("│ Query                                   │ Avg (ms) │ Min (ms) │ Max (ms) │ Med (ms) │");
print("├─────────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┤");

benchmarkResults.forEach((r) => {
  const name = r.name.padEnd(40).substring(0, 40);
  const avg = String(r.avgTime.toFixed ? r.avgTime.toFixed(2) : r.avgTime).padStart(8);
  const min = String(r.minTime.toFixed ? r.minTime.toFixed(2) : r.minTime).padStart(8);
  const max = String(r.maxTime.toFixed ? r.maxTime.toFixed(2) : r.maxTime).padStart(8);
  const med = String(r.median.toFixed ? r.median.toFixed(2) : r.median).padStart(8);
  print(`│ ${name} │ ${avg} │ ${min} │ ${max} │ ${med} │`);
});

print("└─────────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┘");

// ========================================================================
// PERFORMANCE RECOMMENDATIONS
// ========================================================================
print("\n" + "=".repeat(60));
print("PERFORMANCE RECOMMENDATIONS");
print("=".repeat(60));

let recommendationCount = 0;

benchmarkResults.forEach((r) => {
  const threshold = thresholdFor(r.name);
  if (r.avgTime > threshold) {
    recommendationCount++;
    print(`\n${recommendationCount}. ${r.name}:`);
    print(`   Current: ${r.avgTime}ms | Target: <${threshold}ms`);

    if (r.name.includes("Search") || r.name.toLowerCase().includes("regex")) {
      print("   → Consider adding a text index (or Atlas Search) for full-text search");
    } else if (r.name.includes("Range")) {
      print("   → Consider a compound index that supports this range query and common filters");
    } else if (r.name.includes("Aggregation")) {
      print("   → Consider pre-aggregating or adding covering indexes for the pipeline");
    } else if (r.name.includes("Complex")) {
      print(
        "   → Consider a compound index on {category, price, stock_quantity} (or query-specific)"
      );
    } else if (r.name.includes("Batch")) {
      print(
        "   → Consider ordered:false for higher insert throughput; ensure appropriate write concern"
      );
    } else {
      print("   → Review explain() output and add appropriate indexes");
    }
  }
});

if (recommendationCount === 0) {
  print("\n✓ All queries are performing within acceptable thresholds!");
}

// ========================================================================
// EXPORT (stdout JSON)
// ========================================================================
print("\n" + "=".repeat(60));
print("EXPORT (copy from console or redirect stdout)");
print("=".repeat(60));

const exportPayload = {
  timestamp: new Date().toISOString(),
  database: "lab02_ecommerce",
  thresholds: PERFORMANCE_THRESHOLDS,
  results: benchmarkResults,
};

print("\n--- benchmark_results.json (stdout) ---");
print(JSON.stringify(exportPayload, null, 2));

print("\n" + "=".repeat(60));
print("✓ Benchmarks executed successfully!");
print("=".repeat(60));
