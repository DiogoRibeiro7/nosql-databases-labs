/**
 * Lab 02 - Integration Tests for Deliverables
 *
 * This script validates that students have completed all required deliverables
 * for Lab 02 and that their data model supports all required operations.
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Test results tracking
const testResults = {
  deliverables: [],
  queries: [],
  modeling: [],
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

/**
 * Check if a file exists and has content
 */
function checkFile(filePath, minSize = 100) {
  const fileName = path.basename(filePath);

  if (!fs.existsSync(filePath)) {
    return {
      status: "failed",
      message: `File ${fileName} not found`,
      file: fileName
    };
  }

  const stats = fs.statSync(filePath);
  if (stats.size < minSize) {
    return {
      status: "warning",
      message: `File ${fileName} exists but seems incomplete (${stats.size} bytes)`,
      file: fileName,
      size: stats.size
    };
  }

  return {
    status: "passed",
    message: `File ${fileName} exists and has content`,
    file: fileName,
    size: stats.size
  };
}

/**
 * Validate deliverable files
 */
function validateDeliverables() {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING DELIVERABLES");
  console.log("=".repeat(60));

  const requiredFiles = [
    { path: "model.md", description: "NoSQL schema design document" },
    { path: "queries.md", description: "Sample queries document" },
    { path: "NOTES.md", description: "Project notes and assumptions" }
  ];

  const optionalFiles = [
    { path: "BASIC_EXERCISES.md", description: "Basic exercises (optional)" },
    { path: "ADVANCED_EXERCISES.md", description: "Advanced exercises (optional)" },
    { path: "examples", description: "Example documents directory (optional)", isDir: true }
  ];

  console.log("\nRequired Files:");
  console.log("-".repeat(40));

  requiredFiles.forEach(file => {
    const result = checkFile(file.path);
    testResults.deliverables.push({
      type: "required",
      ...result,
      description: file.description
    });

    const icon = result.status === "passed" ? "✓" :
                 result.status === "warning" ? "⚠" : "✗";
    console.log(`${icon} ${file.path}: ${result.message}`);
  });

  console.log("\nOptional Files:");
  console.log("-".repeat(40));

  optionalFiles.forEach(file => {
    if (file.isDir) {
      const exists = fs.existsSync(file.path) && fs.statSync(file.path).isDirectory();
      const result = {
        status: exists ? "passed" : "info",
        message: exists ? "Directory exists" : "Directory not found (optional)",
        file: file.path
      };
      console.log(`${exists ? "✓" : "ℹ"} ${file.path}: ${result.message}`);
    } else {
      const result = checkFile(file.path, 50); // Lower minimum for optional files
      const icon = result.status === "passed" ? "✓" : "ℹ";
      console.log(`${icon} ${file.path}: ${result.message || "Not found (optional)"}`);
    }
  });

  // Check for example JSON documents if examples directory exists
  if (fs.existsSync("examples") && fs.statSync("examples").isDirectory()) {
    const exampleFiles = fs.readdirSync("examples").filter(f => f.endsWith(".json"));
    console.log(`\nFound ${exampleFiles.length} example JSON document(s) in examples/`);

    exampleFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join("examples", file), "utf8");
        JSON.parse(content); // Validate JSON
        console.log(`  ✓ ${file} - Valid JSON`);
      } catch (error) {
        console.log(`  ✗ ${file} - Invalid JSON: ${error.message}`);
        testResults.deliverables.push({
          type: "example",
          status: "failed",
          message: `Invalid JSON in ${file}`,
          error: error.message
        });
      }
    });
  }
}

/**
 * Parse and validate model.md content
 */
function validateModelDocument() {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING MODEL DOCUMENT");
  console.log("=".repeat(60));

  if (!fs.existsSync("model.md")) {
    console.log("✗ model.md not found - skipping content validation");
    return;
  }

  const content = fs.readFileSync("model.md", "utf8");
  const lines = content.toLowerCase();

  // Check for required sections
  const requiredSections = [
    { keyword: "collection", description: "Collection definitions" },
    { keyword: "embed", description: "Embedding decisions" },
    { keyword: "reference", description: "Referencing decisions" },
    { keyword: "index", description: "Index definitions" }
  ];

  console.log("\nChecking for required sections:");
  console.log("-".repeat(40));

  requiredSections.forEach(section => {
    const found = lines.includes(section.keyword);
    const result = {
      section: section.description,
      status: found ? "passed" : "warning",
      message: found ? "Section found" : "Section might be missing"
    };

    testResults.modeling.push(result);
    console.log(`${found ? "✓" : "⚠"} ${section.description}: ${result.message}`);
  });

  // Check for collection definitions
  const collections = ["customer", "product", "order", "review"];
  const foundCollections = collections.filter(c => lines.includes(c));

  console.log(`\nFound ${foundCollections.length}/${collections.length} expected collections mentioned`);
  if (foundCollections.length < collections.length) {
    const missing = collections.filter(c => !foundCollections.includes(c));
    console.log(`  ⚠ Missing collections: ${missing.join(", ")}`);
  }
}

/**
 * Validate query implementations in the database
 */
async function validateQueries(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING QUERY IMPLEMENTATIONS");
  console.log("=".repeat(60));

  const queries = [
    {
      name: "Customer Orders Query",
      description: "List customer's recent orders",
      test: async () => {
        const orders = await db.collection("orders")
          .find({ customer_id: "CUST001" })
          .sort({ order_date: -1 })
          .limit(5)
          .toArray();

        if (orders.length === 0) {
          throw new Error("No orders found for test customer");
        }

        // Check order structure
        const order = orders[0];
        if (!order.customer_id || !order.order_date || !order.items) {
          throw new Error("Order missing required fields");
        }

        return { count: orders.length, sample: order.order_id };
      }
    },
    {
      name: "Order Items Query",
      description: "Show order with all items",
      test: async () => {
        const order = await db.collection("orders")
          .findOne({ order_id: "ORD001" });

        if (!order) {
          throw new Error("Test order ORD001 not found");
        }

        if (!order.items || !Array.isArray(order.items)) {
          throw new Error("Order items not properly embedded");
        }

        if (order.items.length === 0) {
          throw new Error("Order has no items");
        }

        // Check item denormalization
        const item = order.items[0];
        if (!item.product_name || !item.unit_price) {
          throw new Error("Items missing denormalized product data");
        }

        return { itemCount: order.items.length, hasProductNames: true };
      }
    },
    {
      name: "Top Products Query",
      description: "List top N products by sales",
      test: async () => {
        const pipeline = [
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product_id",
              product_name: { $first: "$items.product_name" },
              total_quantity: { $sum: "$items.quantity" },
              total_revenue: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } }
            }
          },
          { $sort: { total_revenue: -1 } },
          { $limit: 5 }
        ];

        const topProducts = await db.collection("orders")
          .aggregate(pipeline)
          .toArray();

        if (topProducts.length === 0) {
          throw new Error("Aggregation returned no results");
        }

        return { count: topProducts.length, topProduct: topProducts[0]._id };
      }
    },
    {
      name: "Category Filter Query",
      description: "Filter products by category",
      test: async () => {
        const products = await db.collection("products")
          .find({ category: "Electronics" })
          .limit(10)
          .toArray();

        if (products.length === 0) {
          throw new Error("No products found in Electronics category");
        }

        // Verify all returned products are in correct category
        const wrongCategory = products.find(p => p.category !== "Electronics");
        if (wrongCategory) {
          throw new Error("Query returned products from wrong category");
        }

        return { count: products.length, verified: true };
      }
    },
    {
      name: "Customer Profile Query",
      description: "Get customer with summary data",
      test: async () => {
        const customer = await db.collection("customers")
          .findOne({ customer_id: "CUST001" });

        if (!customer) {
          throw new Error("Test customer not found");
        }

        // Check for embedded address
        if (!customer.address || typeof customer.address !== "object") {
          throw new Error("Customer address not properly embedded");
        }

        // Check for order summary (if implemented)
        const hasSummary = customer.order_summary &&
                          typeof customer.order_summary === "object";

        return {
          hasAddress: true,
          hasSummary,
          summaryNote: hasSummary ? "Pre-aggregated data found" : "No summary (acceptable)"
        };
      }
    },
    {
      name: "Product Reviews Query",
      description: "Get product reviews (separate collection)",
      test: async () => {
        const reviews = await db.collection("reviews")
          .find({ product_id: "PROD001" })
          .sort({ created_at: -1 })
          .limit(5)
          .toArray();

        // Check that reviews are NOT embedded in products
        const product = await db.collection("products").findOne({ product_id: "PROD001" });
        if (product && product.reviews && Array.isArray(product.reviews)) {
          throw new Error("Reviews should be in separate collection, not embedded (unbounded growth)");
        }

        return {
          reviewCount: reviews.length,
          separateCollection: true,
          note: "Correctly using separate collection for reviews"
        };
      }
    }
  ];

  for (const query of queries) {
    console.log(`\nTesting: ${query.name}`);
    console.log(`  ${query.description}`);

    try {
      const result = await query.test();
      testResults.queries.push({
        name: query.name,
        status: "passed",
        result
      });
      console.log(`  ✓ Query executed successfully`);
      if (result) {
        Object.entries(result).forEach(([key, value]) => {
          console.log(`    - ${key}: ${value}`);
        });
      }
    } catch (error) {
      testResults.queries.push({
        name: query.name,
        status: "failed",
        error: error.message
      });
      console.log(`  ✗ Query failed: ${error.message}`);
    }
  }
}

/**
 * Check index performance
 */
async function validateIndexes(db) {
  console.log("\n" + "=".repeat(60));
  console.log("VALIDATING INDEXES");
  console.log("=".repeat(60));

  const indexChecks = [
    { collection: "customers", field: "customer_id" },
    { collection: "customers", field: "email" },
    { collection: "products", field: "product_id" },
    { collection: "products", field: "category" },
    { collection: "orders", field: "order_id" },
    { collection: "orders", field: "customer_id" },
    { collection: "reviews", field: "product_id" }
  ];

  for (const check of indexChecks) {
    const indexes = await db.collection(check.collection).indexes();
    const hasIndex = indexes.some(idx => {
      const keys = Object.keys(idx.key);
      return keys.includes(check.field);
    });

    console.log(`${hasIndex ? "✓" : "⚠"} ${check.collection}.${check.field}: ${
      hasIndex ? "Index exists" : "No index found (may impact performance)"
    }`);
  }
}

/**
 * Generate integration test report
 */
function generateReport() {
  console.log("\n" + "=".repeat(60));
  console.log("INTEGRATION TEST SUMMARY");
  console.log("=".repeat(60));

  // Count results
  const deliverablesPassed = testResults.deliverables.filter(d => d.status === "passed").length;
  const deliverablesFailed = testResults.deliverables.filter(d => d.status === "failed").length;
  const queriesPassed = testResults.queries.filter(q => q.status === "passed").length;
  const queriesFailed = testResults.queries.filter(q => q.status === "failed").length;

  testResults.summary.totalTests = testResults.deliverables.length + testResults.queries.length;
  testResults.summary.passed = deliverablesPassed + queriesPassed;
  testResults.summary.failed = deliverablesFailed + queriesFailed;

  console.log("\nDeliverables:");
  console.log(`  Passed: ${deliverablesPassed}`);
  console.log(`  Failed: ${deliverablesFailed}`);

  console.log("\nQuery Tests:");
  console.log(`  Passed: ${queriesPassed}/${testResults.queries.length}`);
  console.log(`  Failed: ${queriesFailed}/${testResults.queries.length}`);

  const passRate = testResults.summary.totalTests > 0
    ? (testResults.summary.passed / testResults.summary.totalTests * 100).toFixed(1)
    : 0;

  console.log("\nOverall:");
  console.log(`  Pass Rate: ${passRate}%`);

  // Save report
  const reportFile = "integration_test_report.json";
  fs.writeFileSync(
    reportFile,
    JSON.stringify(testResults, null, 2)
  );

  console.log(`\n✓ Detailed report saved to ${reportFile}`);

  // Lab completion assessment
  console.log("\n" + "=".repeat(60));
  console.log("LAB COMPLETION ASSESSMENT");
  console.log("=".repeat(60));

  const requiredDeliverables = testResults.deliverables
    .filter(d => d.type === "required" && d.status === "passed").length;

  const requiredQueries = testResults.queries
    .filter(q => q.status === "passed").length;

  if (requiredDeliverables >= 3 && requiredQueries >= 4) {
    console.log("\n✅ Lab 02 appears to be COMPLETE!");
    console.log("All required deliverables and core queries are working.");
  } else if (requiredDeliverables >= 2 && requiredQueries >= 2) {
    console.log("\n⚠️ Lab 02 is PARTIALLY COMPLETE");
    console.log("Some deliverables or queries are missing or not working.");
  } else {
    console.log("\n❌ Lab 02 is INCOMPLETE");
    console.log("Missing critical deliverables or query implementations.");
  }

  // Provide specific feedback
  if (testResults.summary.failed > 0) {
    console.log("\nItems requiring attention:");
    testResults.deliverables
      .filter(d => d.status === "failed")
      .forEach(d => console.log(`  - ${d.file}: ${d.message}`));

    testResults.queries
      .filter(q => q.status === "failed")
      .forEach(q => console.log(`  - ${q.name}: ${q.error}`));
  }
}

/**
 * Run all integration tests
 */
async function runIntegrationTests() {
  let client;

  try {
    console.log("Lab 02 - Integration Test Suite");
    console.log("=".repeat(60));

    // Validate deliverable files
    validateDeliverables();
    validateModelDocument();

    // Connect to database for query tests
    console.log("\nConnecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to database: ${DATABASE_NAME}`);

    const db = client.db(DATABASE_NAME);

    // Validate query implementations
    await validateQueries(db);
    await validateIndexes(db);

    // Generate summary report
    generateReport();

  } catch (error) {
    console.error("\nCritical error during integration testing:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

// Run tests
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = { runIntegrationTests };