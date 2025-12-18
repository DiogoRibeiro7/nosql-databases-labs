/* global fs */

/**
 * Lab 02 - Integration Tests for Deliverables (mongosh version)
 *
 * Goal:
 * - Validate that required deliverable files exist (best-effort in mongosh)
 * - Validate that the database (lab02_ecommerce) supports required queries
 * - Validate that key indexes exist
 * - Print a JSON report to stdout (so you can redirect it to a file)
 *
 * Run this file in mongosh:
 *   mongosh lab02_ecommerce --file integration_tests_mongosh.js
 *
 * Export report to a JSON file (recommended):
 *   mongosh lab02_ecommerce --file integration_tests_mongosh.js > integration_test_report.json
 *
 * IMPORTANT (mongosh constraints):
 * - mongosh cannot reliably read local files with Node's fs/path in all environments.
 *   Some mongosh builds expose `fs` via EJSON/Node internals, others don't.
 * - This script does a best-effort file check:
 *     1) If `typeof fs !== "undefined"` exists, it will use fs.
 *     2) Otherwise it marks file checks as "skipped" (not failed).
 * - All DB validations are fully supported.
 */

// Switch to the correct database
use("lab02_ecommerce");

// ------------------------------------------------------------------------
// Test results tracking (same structure as the Node version, adjusted)
// ------------------------------------------------------------------------
const testResults = {
  deliverables: [],
  queries: [],
  modeling: [],
  indexes: [],
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    skipped: 0,
  },
};

/**
 * Print section banner.
 * @param {string} title
 */
function banner(title) {
  print("\n" + "=".repeat(60));
  print(title);
  print("=".repeat(60));
}

/**
 * Add a result entry and update summary counters.
 * @param {"deliverables"|"queries"|"modeling"|"indexes"} bucket
 * @param {object} entry
 */
function pushResult(bucket, entry) {
  testResults[bucket].push(entry);

  testResults.summary.totalTests += 1;
  if (entry.status === "passed") testResults.summary.passed += 1;
  else if (entry.status === "failed") testResults.summary.failed += 1;
  else if (entry.status === "warning") testResults.summary.warnings += 1;
  else if (entry.status === "skipped" || entry.status === "info") testResults.summary.skipped += 1;
}

/**
 * Best-effort file exists + size check.
 * - If fs is unavailable, mark as skipped (mongosh portability).
 *
 * @param {string} filePath
 * @param {number} minSize
 * @param {string} description
 * @param {"required"|"optional"} type
 */
function checkFile(filePath, minSize, description, type) {
  const fileName = filePath;

  // Best effort: fs may or may not be available in a given mongosh distribution
  if (typeof fs === "undefined") {
    const entry = {
      type,
      status: "skipped",
      message: `File check skipped in mongosh (fs not available): ${fileName}`,
      file: fileName,
      description,
    };
    pushResult("deliverables", entry);
    return entry;
  }

  try {
    if (!fs.existsSync(filePath)) {
      const entry = {
        type,
        status: type === "required" ? "failed" : "info",
        message: `File ${fileName} not found${type === "optional" ? " (optional)" : ""}`,
        file: fileName,
        description,
      };
      pushResult("deliverables", entry);
      return entry;
    }

    const stats = fs.statSync(filePath);
    if (stats.size < minSize) {
      const entry = {
        type,
        status: "warning",
        message: `File ${fileName} exists but seems incomplete (${stats.size} bytes)`,
        file: fileName,
        size: stats.size,
        description,
      };
      pushResult("deliverables", entry);
      return entry;
    }

    const entry = {
      type,
      status: "passed",
      message: `File ${fileName} exists and has content`,
      file: fileName,
      size: stats.size,
      description,
    };
    pushResult("deliverables", entry);
    return entry;
  } catch (e) {
    const entry = {
      type,
      status: type === "required" ? "failed" : "warning",
      message: `Error checking ${fileName}: ${e && e.message ? e.message : String(e)}`,
      file: fileName,
      description,
    };
    pushResult("deliverables", entry);
    return entry;
  }
}

/**
 * Validate deliverable files (best-effort).
 */
function validateDeliverables() {
  banner("VALIDATING DELIVERABLES");

  const requiredFiles = [
    { path: "model.md", description: "NoSQL schema design document", minSize: 100 },
    { path: "queries.md", description: "Sample queries document", minSize: 100 },
    { path: "NOTES.md", description: "Project notes and assumptions", minSize: 100 },
  ];

  const optionalFiles = [
    { path: "BASIC_EXERCISES.md", description: "Basic exercises (optional)", minSize: 50 },
    { path: "ADVANCED_EXERCISES.md", description: "Advanced exercises (optional)", minSize: 50 },
  ];

  print("\nRequired Files:");
  print("-".repeat(40));
  requiredFiles.forEach((f) => {
    const r = checkFile(f.path, f.minSize, f.description, "required");
    const icon = r.status === "passed" ? "✓" : r.status === "warning" ? "⚠" : r.status === "skipped" ? "ℹ" : "✗";
    print(`${icon} ${f.path}: ${r.message}`);
  });

  print("\nOptional Files:");
  print("-".repeat(40));
  optionalFiles.forEach((f) => {
    const r = checkFile(f.path, f.minSize, f.description, "optional");
    const icon = r.status === "passed" ? "✓" : r.status === "warning" ? "⚠" : "ℹ";
    print(`${icon} ${f.path}: ${r.message}`);
  });

  // Directory checks (examples/) are also best-effort
  if (typeof fs !== "undefined") {
    try {
      const exists = fs.existsSync("examples") && fs.statSync("examples").isDirectory();
      const entry = {
        type: "optional",
        status: exists ? "passed" : "info",
        file: "examples",
        message: exists ? "Directory exists" : "Directory not found (optional)",
        description: "Example documents directory (optional)",
      };
      pushResult("deliverables", entry);
      print(`\n${exists ? "✓" : "ℹ"} examples: ${entry.message}`);

      if (exists) {
        const exampleFiles = fs.readdirSync("examples").filter((f) => f.endsWith(".json"));
        print(`\nFound ${exampleFiles.length} example JSON document(s) in examples/`);

        exampleFiles.forEach((fname) => {
          try {
            const content = fs.readFileSync(`examples/${fname}`, "utf8");
            JSON.parse(content);
            print(`  ✓ ${fname} - Valid JSON`);
            pushResult("deliverables", {
              type: "example",
              status: "passed",
              file: fname,
              message: "Valid JSON",
              description: "Example JSON document",
            });
          } catch (e) {
            print(`  ✗ ${fname} - Invalid JSON: ${e && e.message ? e.message : String(e)}`);
            pushResult("deliverables", {
              type: "example",
              status: "failed",
              file: fname,
              message: "Invalid JSON",
              error: e && e.message ? e.message : String(e),
              description: "Example JSON document",
            });
          }
        });
      }
    } catch (e) {
      print(`\n⚠ Could not validate examples/: ${e && e.message ? e.message : String(e)}`);
      pushResult("deliverables", {
        type: "optional",
        status: "warning",
        file: "examples",
        message: "Could not validate examples directory",
        error: e && e.message ? e.message : String(e),
        description: "Example documents directory (optional)",
      });
    }
  } else {
    print("\nℹ examples/: directory check skipped in mongosh (fs not available)");
    pushResult("deliverables", {
      type: "optional",
      status: "skipped",
      file: "examples",
      message: "Directory check skipped in mongosh (fs not available)",
      description: "Example documents directory (optional)",
    });
  }
}

/**
 * Validate model.md content (best-effort).
 */
function validateModelDocument() {
  banner("VALIDATING MODEL DOCUMENT");

  if (typeof fs === "undefined") {
    print("ℹ model.md content validation skipped (fs not available in mongosh)");
    pushResult("modeling", {
      section: "model.md content checks",
      status: "skipped",
      message: "Skipped (fs not available)",
    });
    return;
  }

  if (!fs.existsSync("model.md")) {
    print("✗ model.md not found - skipping content validation");
    pushResult("modeling", {
      section: "model.md exists",
      status: "failed",
      message: "model.md not found",
    });
    return;
  }

  const content = fs.readFileSync("model.md", "utf8");
  const lines = content.toLowerCase();

  const requiredSections = [
    { keyword: "collection", description: "Collection definitions" },
    { keyword: "embed", description: "Embedding decisions" },
    { keyword: "reference", description: "Referencing decisions" },
    { keyword: "index", description: "Index definitions" },
  ];

  print("\nChecking for required sections:");
  print("-".repeat(40));

  requiredSections.forEach((s) => {
    const found = lines.includes(s.keyword);
    const entry = {
      section: s.description,
      status: found ? "passed" : "warning",
      message: found ? "Section found" : "Section might be missing",
    };
    pushResult("modeling", entry);
    print(`${found ? "✓" : "⚠"} ${s.description}: ${entry.message}`);
  });

  const collections = ["customer", "product", "order", "review"];
  const foundCollections = collections.filter((c) => lines.includes(c));
  print(`\nFound ${foundCollections.length}/${collections.length} expected collections mentioned`);
  if (foundCollections.length < collections.length) {
    const missing = collections.filter((c) => !foundCollections.includes(c));
    print(`  ⚠ Missing collections: ${missing.join(", ")}`);
    pushResult("modeling", {
      section: "Expected collections mentioned",
      status: "warning",
      message: `Missing collections: ${missing.join(", ")}`,
    });
  } else {
    pushResult("modeling", {
      section: "Expected collections mentioned",
      status: "passed",
      message: "All expected collections mentioned",
    });
  }
}

/**
 * Validate query implementations in the database (pure mongosh).
 */
function validateQueries() {
  banner("VALIDATING QUERY IMPLEMENTATIONS");

  const tests = [
    {
      name: "Customer Orders Query",
      description: "List customer's recent orders",
      run: () => {
        const orders = db.orders
          .find({ customer_id: "CUST001" })
          .sort({ order_date: -1 })
          .limit(5)
          .toArray();

        if (orders.length === 0) throw new Error("No orders found for test customer");

        const order = orders[0];
        if (!order.customer_id || !order.order_date || !order.items) throw new Error("Order missing required fields");

        return { count: orders.length, sample: order.order_id };
      },
    },
    {
      name: "Order Items Query",
      description: "Show order with all items",
      run: () => {
        const order = db.orders.findOne({ order_id: "ORD001" });
        if (!order) throw new Error("Test order ORD001 not found");

        if (!order.items || !Array.isArray(order.items)) throw new Error("Order items not properly embedded");
        if (order.items.length === 0) throw new Error("Order has no items");

        const item = order.items[0];
        if (!item.product_name || !item.unit_price) throw new Error("Items missing denormalized product data");

        return { itemCount: order.items.length, hasProductNames: true };
      },
    },
    {
      name: "Top Products Query",
      description: "List top N products by sales",
      run: () => {
        const pipeline = [
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product_id",
              product_name: { $first: "$items.product_name" },
              total_quantity: { $sum: "$items.quantity" },
              total_revenue: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } },
            },
          },
          { $sort: { total_revenue: -1 } },
          { $limit: 5 },
        ];

        const topProducts = db.orders.aggregate(pipeline).toArray();
        if (topProducts.length === 0) throw new Error("Aggregation returned no results");

        return { count: topProducts.length, topProduct: topProducts[0]._id };
      },
    },
    {
      name: "Category Filter Query",
      description: "Filter products by category",
      run: () => {
        const products = db.products.find({ category: "Electronics" }).limit(10).toArray();
        if (products.length === 0) throw new Error("No products found in Electronics category");

        const wrongCategory = products.find((p) => p.category !== "Electronics");
        if (wrongCategory) throw new Error("Query returned products from wrong category");

        return { count: products.length, verified: true };
      },
    },
    {
      name: "Customer Profile Query",
      description: "Get customer with summary data",
      run: () => {
        const customer = db.customers.findOne({ customer_id: "CUST001" });
        if (!customer) throw new Error("Test customer not found");

        if (!customer.address || typeof customer.address !== "object") {
          throw new Error("Customer address not properly embedded");
        }

        const hasSummary = !!(customer.order_summary && typeof customer.order_summary === "object");

        return {
          hasAddress: true,
          hasSummary: hasSummary,
          summaryNote: hasSummary ? "Pre-aggregated data found" : "No summary (acceptable)",
        };
      },
    },
    {
      name: "Product Reviews Query",
      description: "Get product reviews (separate collection)",
      run: () => {
        const reviews = db.reviews
          .find({ product_id: "PROD001" })
          .sort({ created_at: -1 })
          .limit(5)
          .toArray();

        const product = db.products.findOne({ product_id: "PROD001" });
        if (product && product.reviews && Array.isArray(product.reviews)) {
          throw new Error("Reviews should be in separate collection, not embedded (unbounded growth)");
        }

        return {
          reviewCount: reviews.length,
          separateCollection: true,
          note: "Correctly using separate collection for reviews",
        };
      },
    },
  ];

  tests.forEach((t) => {
    print(`\nTesting: ${t.name}`);
    print(`  ${t.description}`);

    try {
      const result = t.run();
      pushResult("queries", { name: t.name, status: "passed", result });
      print("  ✓ Query executed successfully");
      if (result) {
        Object.entries(result).forEach(([k, v]) => print(`    - ${k}: ${v}`));
      }
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      pushResult("queries", { name: t.name, status: "failed", error: msg });
      print(`  ✗ Query failed: ${msg}`);
    }
  });
}

/**
 * Validate indexes (pure mongosh).
 */
function validateIndexes() {
  banner("VALIDATING INDEXES");

  const indexChecks = [
    { collection: "customers", field: "customer_id" },
    { collection: "customers", field: "email" },
    { collection: "products", field: "product_id" },
    { collection: "products", field: "category" },
    { collection: "orders", field: "order_id" },
    { collection: "orders", field: "customer_id" },
    { collection: "reviews", field: "product_id" },
  ];

  indexChecks.forEach((check) => {
    try {
      const indexes = db.getCollection(check.collection).getIndexes();
      const hasIndex = indexes.some((idx) => Object.keys(idx.key).includes(check.field));

      const entry = {
        collection: check.collection,
        field: check.field,
        status: hasIndex ? "passed" : "warning",
        message: hasIndex ? "Index exists" : "No index found (may impact performance)",
      };
      pushResult("indexes", entry);

      print(
        `${hasIndex ? "✓" : "⚠"} ${check.collection}.${check.field}: ${
          hasIndex ? "Index exists" : "No index found (may impact performance)"
        }`
      );
    } catch (e) {
      const entry = {
        collection: check.collection,
        field: check.field,
        status: "warning",
        message: "Could not read indexes",
        error: e && e.message ? e.message : String(e),
      };
      pushResult("indexes", entry);
      print(`⚠ ${check.collection}.${check.field}: Could not read indexes`);
    }
  });
}

/**
 * Generate integration test report (stdout JSON; redirect if needed).
 */
function generateReport() {
  banner("INTEGRATION TEST SUMMARY");

  const deliverablesPassed = testResults.deliverables.filter((d) => d.status === "passed").length;
  const deliverablesFailed = testResults.deliverables.filter((d) => d.status === "failed").length;

  const queriesPassed = testResults.queries.filter((q) => q.status === "passed").length;
  const queriesFailed = testResults.queries.filter((q) => q.status === "failed").length;

  print("\nDeliverables:");
  print(`  Passed: ${deliverablesPassed}`);
  print(`  Failed: ${deliverablesFailed}`);
  print(`  Warnings: ${testResults.deliverables.filter((d) => d.status === "warning").length}`);
  print(`  Skipped/Info: ${testResults.deliverables.filter((d) => d.status === "skipped" || d.status === "info").length}`);

  print("\nQuery Tests:");
  print(`  Passed: ${queriesPassed}/${testResults.queries.length}`);
  print(`  Failed: ${queriesFailed}/${testResults.queries.length}`);

  const passRate =
    testResults.summary.totalTests > 0
      ? ((testResults.summary.passed / testResults.summary.totalTests) * 100).toFixed(1)
      : "0.0";
  print("\nOverall:");
  print(`  Total Tests: ${testResults.summary.totalTests}`);
  print(`  Passed:      ${testResults.summary.passed}`);
  print(`  Failed:      ${testResults.summary.failed}`);
  print(`  Warnings:    ${testResults.summary.warnings}`);
  print(`  Skipped/Info:${testResults.summary.skipped}`);
  print(`  Pass Rate:   ${passRate}%`);

  banner("LAB COMPLETION ASSESSMENT");

  const requiredDeliverablesPassed = testResults.deliverables.filter(
    (d) => d.type === "required" && d.status === "passed"
  ).length;

  const requiredQueriesPassed = testResults.queries.filter((q) => q.status === "passed").length;

  if (requiredDeliverablesPassed >= 3 && requiredQueriesPassed >= 4) {
    print("\n✅ Lab 02 appears to be COMPLETE!");
    print("All required deliverables and core queries are working.");
  } else if (requiredDeliverablesPassed >= 2 && requiredQueriesPassed >= 2) {
    print("\n⚠ Lab 02 is PARTIALLY COMPLETE");
    print("Some deliverables or queries are missing or not working.");
  } else {
    print("\n❌ Lab 02 is INCOMPLETE");
    print("Missing critical deliverables or query implementations.");
  }

  if (testResults.summary.failed > 0) {
    print("\nItems requiring attention:");
    testResults.deliverables
      .filter((d) => d.status === "failed")
      .forEach((d) => print(`  - ${d.file}: ${d.message}`));

    testResults.queries
      .filter((q) => q.status === "failed")
      .forEach((q) => print(`  - ${q.name}: ${q.error}`));
  }

  banner("EXPORT (stdout JSON)");
  const exportPayload = {
    timestamp: new Date().toISOString(),
    database: "lab02_ecommerce",
    results: testResults,
    note:
      typeof fs === "undefined"
        ? "Deliverable file checks may be skipped because fs is not available in this mongosh environment."
        : "Deliverable file checks executed using fs.",
  };

  print(JSON.stringify(exportPayload, null, 2));
}

// ------------------------------------------------------------------------
// Main execution (mongosh style)
// ------------------------------------------------------------------------
print("Lab 02 - Integration Test Suite (mongosh)");
print("=".repeat(60));

try {
  validateDeliverables();
  validateModelDocument();
  validateQueries();
  validateIndexes();
  generateReport();
} catch (e) {
  const msg = e && e.stack ? e.stack : String(e);
  print("\nCritical error during integration testing:");
  print(msg);

  // still export partial results
  print("\n--- Partial Results (stdout JSON) ---");
  print(JSON.stringify({ timestamp: new Date().toISOString(), database: "lab02_ecommerce", results: testResults }, null, 2));
}
