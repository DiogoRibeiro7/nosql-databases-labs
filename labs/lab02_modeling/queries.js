/**
 * Lab 02 - Executable Queries
 *
 * This file contains executable versions of the queries from queries.md.
 * Run this file to demonstrate how the data model supports required operations.
 */

const { MongoClient } = require("mongodb");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

/**
 * Pretty-print query results with a heading and optional limit so
 * long responses remain readable in the terminal.
 *
 * @param {string} title - Heading displayed above the results.
 * @param {Array} results - Array of documents to show.
 * @param {number} [limit=5] - Optional limit for console output.
 */
function printResults (title, results, limit = 5) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(title);
  console.log("=".repeat(60));

  if (!results || results.length === 0) {
    console.log("No results found.");
    return;
  }

  const displayResults = limit ? results.slice(0, limit) : results;
  displayResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${JSON.stringify(result, null, 2)}`);
  });

  if (results.length > limit && limit) {
    console.log(`\n... and ${results.length - limit} more results`);
  }
  console.log(`\nTotal results: ${results.length}`);
}

/**
 * Connect to MongoDB and execute the end-to-end demo queries that
 * validate the modeling decisions for Lab 02.
 *
 * @returns {Promise<void>}
 */
async function runQueries () {
  let client;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected to database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    // ========================================================================
    // Query 1: Given a Customer, List Their Recent Orders
    // ========================================================================
    console.log("\n" + "█".repeat(60));
    console.log("QUERY 1: Customer's Recent Orders");
    console.log("█".repeat(60));

    const customerOrders = await db
      .collection("orders")
      .find({ customer_id: "CUST001" })
      .sort({ order_date: -1 })
      .project({
        order_id: 1,
        order_date: 1,
        status: 1,
        total: 1,
        "items.product_name": 1,
        "items.quantity": 1,
        _id: 0,
      })
      .toArray();

    printResults("Orders for Customer CUST001 (Recent First)", customerOrders);

    // ========================================================================
    // Query 2: Given an Order, Show All Its Items
    // ========================================================================
    console.log("\n" + "█".repeat(60));
    console.log("QUERY 2: Order Details with All Items");
    console.log("█".repeat(60));

    const orderDetails = await db.collection("orders").findOne(
      { order_id: "ORD001" },
      {
        projection: {
          order_id: 1,
          customer_id: 1,
          order_date: 1,
          status: 1,
          items: 1,
          total: 1,
          _id: 0,
        },
      }
    );

    if (orderDetails) {
      console.log("\nOrder ORD001 Details:");
      console.log("=".repeat(40));
      console.log(`Order ID: ${orderDetails.order_id}`);
      console.log(`Customer: ${orderDetails.customer_id}`);
      console.log(`Date: ${orderDetails.order_date}`);
      console.log(`Status: ${orderDetails.status}`);
      console.log(`Total: $${orderDetails.total}`);
      console.log("\nItems:");
      orderDetails.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.product_name}`);
        console.log(`     Quantity: ${item.quantity}`);
        console.log(`     Unit Price: $${item.unit_price}`);
        console.log(`     Subtotal: $${item.subtotal}`);
      });
    }

    // ========================================================================
    // Query 3: List Top N Products by Total Quantity Sold
    // ========================================================================
    console.log("\n" + "█".repeat(60));
    console.log("QUERY 3: Top Products by Quantity Sold");
    console.log("█".repeat(60));

    const topProducts = await db
      .collection("orders")
      .aggregate([
        // Flatten each order item first so we can aggregate quantities per product.
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product_id",
            product_name: { $first: "$items.product_name" },
            total_quantity_sold: { $sum: "$items.quantity" },
            total_revenue: { $sum: "$items.subtotal" },
            order_count: { $sum: 1 },
          },
        },
        { $sort: { total_quantity_sold: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            product_id: "$_id",
            product_name: 1,
            total_quantity_sold: 1,
            total_revenue: { $round: ["$total_revenue", 2] },
            order_count: 1,
          },
        },
      ])
      .toArray();

    console.log("\nTop 5 Best-Selling Products:");
    console.log("=".repeat(40));
    topProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.product_name}`);
      console.log(`   Product ID: ${product.product_id}`);
      console.log(`   Quantity Sold: ${product.total_quantity_sold} units`);
      console.log(`   Total Revenue: $${product.total_revenue}`);
      console.log(`   Orders: ${product.order_count}`);
    });

    // ========================================================================
    // Query 4: Search/Filter Products by Category
    // ========================================================================
    console.log("\n" + "█".repeat(60));
    console.log("QUERY 4: Products by Category");
    console.log("█".repeat(60));

    // 4a. Simple category filter
    const electronicsProducts = await db
      .collection("products")
      .find({ category: "Electronics" })
      .sort({ "ratings.average": -1 })
      .project({
        product_id: 1,
        name: 1,
        price: 1,
        category: 1,
        ratings: 1,
        _id: 0,
      })
      .toArray();

    console.log("\nElectronics Products (Sorted by Rating):");
    console.log("=".repeat(40));
    electronicsProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Rating: ${product.ratings.average}/5 (${product.ratings.count} reviews)`);
    });

    // 4b. Category with price range
    const affordableElectronics = await db
      .collection("products")
      .find({
        category: "Electronics",
        price: { $gte: 50, $lte: 200 },
      })
      .sort({ price: 1 })
      .project({
        name: 1,
        price: 1,
        _id: 0,
      })
      .toArray();

    console.log("\nAffordable Electronics ($50-$200):");
    console.log("=".repeat(40));
    affordableElectronics.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
    });

    // ========================================================================
    // Additional Queries
    // ========================================================================
    console.log("\n" + "█".repeat(60));
    console.log("ADDITIONAL ANALYTICS");
    console.log("█".repeat(60));

    // Customer spending summary
    const customerSpending = await db
      .collection("orders")
      .aggregate([
        { $match: { customer_id: "CUST001" } },
        {
          $group: {
            _id: "$customer_id",
            total_orders: { $sum: 1 },
            total_spent: { $sum: "$total" },
            average_order_value: { $avg: "$total" },
            first_order: { $min: "$order_date" },
            last_order: { $max: "$order_date" },
          },
        },
      ])
      .toArray();

    if (customerSpending.length > 0) {
      const stats = customerSpending[0];
      console.log("\nCustomer CUST001 Analytics:");
      console.log("=".repeat(40));
      console.log(`Total Orders: ${stats.total_orders}`);
      console.log(`Total Spent: $${stats.total_spent.toFixed(2)}`);
      console.log(`Average Order Value: $${stats.average_order_value.toFixed(2)}`);
      console.log(`First Order: ${stats.first_order}`);
      console.log(`Last Order: ${stats.last_order}`);
    }

    // Products with low stock
    const lowStockProducts = await db
      .collection("products")
      .find({ stock_quantity: { $lt: 20 } })
      .sort({ stock_quantity: 1 })
      .project({
        product_id: 1,
        name: 1,
        stock_quantity: 1,
        _id: 0,
      })
      .toArray();

    if (lowStockProducts.length > 0) {
      console.log("\nLow Stock Alert (< 20 units):");
      console.log("=".repeat(40));
      lowStockProducts.forEach(product => {
        console.log(`⚠ ${product.name}: ${product.stock_quantity} units remaining`);
      });
    }

    // Recent reviews for a product
    const recentReviews = await db
      .collection("reviews")
      .find({ product_id: "PROD001" })
      .sort({ created_at: -1 })
      .limit(3)
      .project({
        customer_name: 1,
        rating: 1,
        title: 1,
        comment: 1,
        created_at: 1,
        _id: 0,
      })
      .toArray();

    console.log("\nRecent Reviews for Product PROD001:");
    console.log("=".repeat(40));
    recentReviews.forEach((review, index) => {
      console.log(`\n${index + 1}. ${review.title} (${review.rating}/5 stars)`);
      console.log(`   By: ${review.customer_name}`);
      console.log(`   Date: ${review.created_at}`);
      console.log(`   "${review.comment}"`);
    });

    // ========================================================================
    // Performance Analysis
    // ========================================================================
    console.log("\n" + "█".repeat(60));
    console.log("QUERY PERFORMANCE ANALYSIS");
    console.log("█".repeat(60));

    // Check indexes being used
    const explainResult = await db
      .collection("orders")
      .find({ customer_id: "CUST001" })
      .sort({ order_date: -1 })
      .explain("executionStats");

    console.log("\nIndex Usage for Customer Orders Query:");
    console.log("=".repeat(40));
    if (explainResult.executionStats) {
      console.log(`Execution Time: ${explainResult.executionStats.executionTimeMillis}ms`);
      console.log(`Documents Examined: ${explainResult.executionStats.totalDocsExamined}`);
      console.log(`Documents Returned: ${explainResult.executionStats.nReturned}`);
      console.log(
        `Index Used: ${explainResult.executionStats.executionStages.indexName || "COLLSCAN"}`
      );
    }

    console.log("\n✓ All queries executed successfully!");
  } catch (error) {
    console.error("\nError running queries:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

// Run the queries
if (require.main === module) {
  console.log("Lab 02 - Data Model Query Demonstrations");
  console.log("=".repeat(60));
  runQueries().catch(console.error);
}

module.exports = { runQueries, DATABASE_NAME };
