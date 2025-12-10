/**
 * Lab 02 - Query Tests
 *
 * This script tests that all required queries work correctly with the data model.
 * It validates that the model supports all required operations efficiently.
 */

const { MongoClient } = require("mongodb");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Test results tracking
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function to run a test
async function runTest (testName, testFunc) {
  try {
    console.log(`\nRunning: ${testName}...`);
    await testFunc();
    passedTests++;
    testResults.push({ test: testName, status: "✓ PASSED" });
    console.log(`✓ PASSED: ${testName}`);
    return true;
  } catch (error) {
    failedTests++;
    testResults.push({ test: testName, status: "✗ FAILED", error: error.message });
    console.error(`✗ FAILED: ${testName}`);
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

// Test helper to assert conditions
function assert (condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

async function testQueries () {
  let client;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    console.log("=".repeat(60));
    console.log("Running Query Tests");
    console.log("=".repeat(60));

    // ========================================================================
    // Test 1: Verify Collections Exist
    // ========================================================================
    await runTest("Collections exist", async () => {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      assert(collectionNames.includes("customers"), "customers collection missing");
      assert(collectionNames.includes("products"), "products collection missing");
      assert(collectionNames.includes("orders"), "orders collection missing");
      assert(collectionNames.includes("reviews"), "reviews collection missing");
    });

    // ========================================================================
    // Test 2: Verify Data Exists
    // ========================================================================
    await runTest("Data exists in collections", async () => {
      const customerCount = await db.collection("customers").countDocuments();
      const productCount = await db.collection("products").countDocuments();
      const orderCount = await db.collection("orders").countDocuments();
      const reviewCount = await db.collection("reviews").countDocuments();

      assert(customerCount > 0, "No customers found");
      assert(productCount > 0, "No products found");
      assert(orderCount > 0, "No orders found");
      assert(reviewCount > 0, "No reviews found");

      console.log(
        `  Found: ${customerCount} customers, ${productCount} products, ${orderCount} orders, ${reviewCount} reviews`
      );
    });

    // ========================================================================
    // Test 3: Test Customer Orders Query (Requirement 1)
    // ========================================================================
    await runTest("Query 1: Get customer recent orders", async () => {
      const orders = await db
        .collection("orders")
        .find({ customer_id: "CUST001" })
        .sort({ order_date: -1 })
        .toArray();

      assert(orders.length > 0, "No orders found for customer CUST001");
      assert(orders[0].customer_id === "CUST001", "Wrong customer ID in results");

      // Verify orders are sorted by date (descending)
      for (let i = 1; i < orders.length; i++) {
        const prevDate = new Date(orders[i - 1].order_date);
        const currDate = new Date(orders[i].order_date);
        assert(prevDate >= currDate, "Orders not sorted by date correctly");
      }
    });

    // ========================================================================
    // Test 4: Test Order Items Query (Requirement 2)
    // ========================================================================
    await runTest("Query 2: Get order with all items", async () => {
      const order = await db.collection("orders").findOne({ order_id: "ORD001" });

      assert(order !== null, "Order ORD001 not found");
      assert(Array.isArray(order.items), "Order items should be an array");
      assert(order.items.length > 0, "Order should have items");

      // Verify embedded items have required fields
      order.items.forEach(item => {
        assert(item.product_id, "Item missing product_id");
        assert(item.product_name, "Item missing product_name");
        assert(item.quantity > 0, "Item quantity should be positive");
        assert(item.unit_price > 0, "Item unit_price should be positive");
      });

      // Verify no additional query needed (items are embedded)
      assert(order.items[0].product_name, "Product names should be denormalized in order items");
    });

    // ========================================================================
    // Test 5: Test Top Products Query (Requirement 3)
    // ========================================================================
    await runTest("Query 3: Get top products by sales", async () => {
      const topProducts = await db
        .collection("orders")
        .aggregate([
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.product_id",
              product_name: { $first: "$items.product_name" },
              total_quantity_sold: { $sum: "$items.quantity" },
            },
          },
          { $sort: { total_quantity_sold: -1 } },
          { $limit: 5 },
        ])
        .toArray();

      assert(topProducts.length > 0, "No top products found");
      assert(topProducts[0].total_quantity_sold > 0, "Top product should have sales");

      // Verify sorting
      for (let i = 1; i < topProducts.length; i++) {
        assert(
          topProducts[i - 1].total_quantity_sold >= topProducts[i].total_quantity_sold,
          "Products not sorted by quantity correctly"
        );
      }
    });

    // ========================================================================
    // Test 6: Test Category Filter Query (Requirement 4)
    // ========================================================================
    await runTest("Query 4: Filter products by category", async () => {
      const products = await db.collection("products").find({ category: "Electronics" }).toArray();

      assert(products.length > 0, "No products found in Electronics category");
      products.forEach(product => {
        assert(product.category === "Electronics", "Wrong category in results");
      });

      // Test with price range
      const filteredProducts = await db
        .collection("products")
        .find({
          category: "Electronics",
          price: { $gte: 50, $lte: 500 },
        })
        .toArray();

      filteredProducts.forEach(product => {
        assert(product.price >= 50 && product.price <= 500, "Price out of range");
      });
    });

    // ========================================================================
    // Test 7: Verify Indexes Exist
    // ========================================================================
    await runTest("Required indexes exist", async () => {
      // Check customers indexes
      const customerIndexes = await db.collection("customers").indexes();
      const customerIndexNames = customerIndexes.map(idx => idx.name);
      assert(
        customerIndexNames.some(n => n.includes("customer_id")),
        "Missing customer_id index"
      );
      assert(
        customerIndexNames.some(n => n.includes("email")),
        "Missing email index"
      );

      // Check products indexes
      const productIndexes = await db.collection("products").indexes();
      const productIndexNames = productIndexes.map(idx => idx.name);
      assert(
        productIndexNames.some(n => n.includes("category")),
        "Missing category index"
      );
      assert(
        productIndexNames.some(n => n.includes("product_id")),
        "Missing product_id index"
      );

      // Check orders indexes
      const orderIndexes = await db.collection("orders").indexes();
      const orderIndexNames = orderIndexes.map(idx => idx.name);
      assert(
        orderIndexNames.some(n => n.includes("customer_id")),
        "Missing customer_id index on orders"
      );
      assert(
        orderIndexNames.some(n => n.includes("order_id")),
        "Missing order_id index"
      );

      console.log(`  Found ${customerIndexes.length} indexes on customers`);
      console.log(`  Found ${productIndexes.length} indexes on products`);
      console.log(`  Found ${orderIndexes.length} indexes on orders`);
    });

    // ========================================================================
    // Test 8: Test Data Integrity
    // ========================================================================
    await runTest("Data integrity checks", async () => {
      // Check unique constraints
      const customers = await db.collection("customers").find().toArray();
      const emails = customers.map(c => c.email);
      const uniqueEmails = [...new Set(emails)];
      assert(emails.length === uniqueEmails.length, "Duplicate emails found");

      // Check referential integrity
      const orders = await db.collection("orders").find().toArray();
      const customerIds = customers.map(c => c.customer_id);

      orders.forEach(order => {
        assert(
          customerIds.includes(order.customer_id),
          `Order ${order.order_id} references non-existent customer ${order.customer_id}`
        );
      });

      // Check denormalized data consistency
      const products = await db.collection("products").find().toArray();
      const productMap = {};
      products.forEach(p => (productMap[p.product_id] = p));

      orders.forEach(order => {
        order.items.forEach(item => {
          // Denormalized product names should exist (historical data)
          assert(item.product_name, `Missing product name in order ${order.order_id}`);
        });
      });
    });

    // ========================================================================
    // Test 9: Test Query Performance
    // ========================================================================
    await runTest("Query performance with indexes", async () => {
      // Test indexed query performance
      const explainResult = await db
        .collection("orders")
        .find({ customer_id: "CUST001" })
        .explain("executionStats");

      if (explainResult.executionStats) {
        const stats = explainResult.executionStats;

        // Should use index, not collection scan
        if (stats.executionStages) {
          const stage = stats.executionStages.stage;
          assert(stage !== "COLLSCAN", "Query should use index, not collection scan");
        }

        // Should be efficient
        assert(
          stats.totalDocsExamined <= stats.nReturned * 2,
          "Query examining too many documents (inefficient)"
        );

        console.log(`  Execution time: ${stats.executionTimeMillis}ms`);
        console.log(`  Docs examined: ${stats.totalDocsExamined}`);
        console.log(`  Docs returned: ${stats.nReturned}`);
      }
    });

    // ========================================================================
    // Test 10: Test Embedded vs Referenced Design
    // ========================================================================
    await runTest("Embedded vs Referenced design validation", async () => {
      // Verify order items are embedded (not referenced)
      const order = await db.collection("orders").findOne();
      assert(Array.isArray(order.items), "Order items should be embedded array");
      assert(order.items[0].product_name, "Product info should be denormalized in items");

      // Verify reviews are NOT embedded in products (separate collection)
      const product = await db.collection("products").findOne();
      assert(
        !product.reviews || !Array.isArray(product.reviews),
        "Reviews should NOT be embedded in products (unbounded growth)"
      );

      // Verify customer address is embedded
      const customer = await db.collection("customers").findOne();
      assert(
        customer.address && typeof customer.address === "object",
        "Customer address should be embedded"
      );
    });

    // ========================================================================
    // Print Test Summary
    // ========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("TEST RESULTS SUMMARY");
    console.log("=".repeat(60));

    testResults.forEach(result => {
      console.log(`${result.status} ${result.test}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log(`TOTAL: ${passedTests} passed, ${failedTests} failed`);

    if (failedTests === 0) {
      console.log("\n✓ All tests passed successfully!");
      console.log("The data model correctly supports all required operations.");
    } else {
      console.log(`\n✗ ${failedTests} test(s) failed.`);
      console.log("Please review the data model and fix the issues.");
      process.exit(1);
    }
  } catch (error) {
    console.error("\nCritical error during testing:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

// Run the tests
if (require.main === module) {
  console.log("Lab 02 - Data Model Test Suite");
  console.log("=".repeat(60));
  testQueries().catch(console.error);
}

module.exports = { testQueries, DATABASE_NAME };
