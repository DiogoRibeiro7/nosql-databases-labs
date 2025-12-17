/**
 * Lab 02 - E-Commerce Data Model Queries (mongosh version)
 *
 * Run this file in mongosh:
 * mongosh lab02_ecommerce --file queries_mongosh.js
 *
 * Or copy and paste individual queries into mongosh
 */

// Switch to the correct database
use("lab02_ecommerce");

print("=".repeat(60));
print("Lab 02 - Data Model Query Demonstrations");
print("=".repeat(60));

// ========================================================================
// Query 1: Given a Customer, List Their Recent Orders
// ========================================================================
print("\n█".repeat(60));
print("QUERY 1: Customer's Recent Orders");
print("█".repeat(60));

// Simple find query
// Simple find query that relies on embedded items to avoid extra lookups.
const customerOrders = db.orders
  .find({ customer_id: "CUST001" })
  .sort({ order_date: -1 })
  .toArray();

print("\nOrders for Customer CUST001 (Recent First):");
customerOrders.forEach((order, index) => {
  print(`\n${index + 1}. Order ${order.order_id}`);
  print(`   Date: ${order.order_date}`);
  print(`   Status: ${order.status}`);
  print(`   Total: $${order.total}`);
  print(`   Items: ${order.items.length} product(s)`);
  order.items.forEach((item) => {
    print(`     - ${item.product_name} (qty: ${item.quantity})`);
  });
});

// Using aggregation pipeline for more control
print("\n--- Using Aggregation Pipeline ---");
// Aggregation flavor of the same query for summaries/counts.
const customerOrdersAgg = db.orders
  .aggregate([
    { $match: { customer_id: "CUST001" } },
    { $sort: { order_date: -1 } },
    {
      $project: {
        order_id: 1,
        order_date: 1,
        status: 1,
        total: 1,
        item_count: { $size: "$items" },
      },
    },
  ])
  .toArray();

print("Summary:");
customerOrdersAgg.forEach((order) => {
  print(`  ${order.order_id}: ${order.status} - $${order.total} (${order.item_count} items)`);
});

// ========================================================================
// Query 2: Given an Order, Show All Its Items
// ========================================================================
print("\n█".repeat(60));
print("QUERY 2: Order Details with All Items");
print("█".repeat(60));

const orderDetails = db.orders.findOne({ order_id: "ORD001" });

if (orderDetails) {
  print("\nOrder ORD001 Details:");
  print("=".repeat(40));
  print(`Order ID: ${orderDetails.order_id}`);
  print(`Customer: ${orderDetails.customer_id}`);
  print(`Date: ${orderDetails.order_date}`);
  print(`Status: ${orderDetails.status}`);
  print(`Total: $${orderDetails.total}`);
  print("\nItems:");
  orderDetails.items.forEach((item, index) => {
    print(`  ${index + 1}. ${item.product_name}`);
    print(`     Product ID: ${item.product_id}`);
    print(`     Quantity: ${item.quantity}`);
    print(`     Unit Price: $${item.unit_price}`);
    print(`     Subtotal: $${item.subtotal}`);
  });
}

// ========================================================================
// Query 3: List Top N Products by Total Quantity Sold
// ========================================================================
print("\n█".repeat(60));
print("QUERY 3: Top Products by Quantity Sold");
print("█".repeat(60));

const topProducts = db.orders
  .aggregate([
    // Unwind items array to process each item separately.
    { $unwind: "$items" },

    // Group by product and sum quantities
    {
      $group: {
        _id: "$items.product_id",
        product_name: { $first: "$items.product_name" },
        total_quantity_sold: { $sum: "$items.quantity" },
        total_revenue: { $sum: "$items.subtotal" },
        order_count: { $sum: 1 },
      },
    },

    // Sort by total quantity (descending)
    { $sort: { total_quantity_sold: -1 } },

    // Limit to top 5
    { $limit: 5 },

    // Reshape output
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

print("\nTop 5 Best-Selling Products:");
print("=".repeat(40));
topProducts.forEach((product, index) => {
  print(`\n${index + 1}. ${product.product_name}`);
  print(`   Product ID: ${product.product_id}`);
  print(`   Quantity Sold: ${product.total_quantity_sold} units`);
  print(`   Total Revenue: $${product.total_revenue}`);
  print(`   Orders: ${product.order_count}`);
});

// Alternative: Top Products by Revenue
print("\n--- Top Products by Revenue ---");
// Variant that ranks products by revenue instead of quantity.
const topByRevenue = db.orders
  .aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product_id",
        product_name: { $first: "$items.product_name" },
        total_revenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { total_revenue: -1 } },
    { $limit: 3 },
  ])
  .toArray();

topByRevenue.forEach((product, index) => {
  print(`${index + 1}. ${product.product_name}: $${product.total_revenue.toFixed(2)}`);
});

// ========================================================================
// Query 4: Search/Filter Products by Category
// ========================================================================
print("\n█".repeat(60));
print("QUERY 4: Products by Category");
print("█".repeat(60));

// Simple category filter
print("\nElectronics Products (sorted by rating):");
const electronicsProducts = db.products
  .find({ category: "Electronics" })
  .sort({ "ratings.average": -1 })
  .limit(5)
  .toArray();

electronicsProducts.forEach((product, index) => {
  print(`${index + 1}. ${product.name}`);
  print(`   Price: $${product.price}`);
  print(`   Rating: ${product.ratings.average}/5 (${product.ratings.count} reviews)`);
});

// Category with price range
print("\nAffordable Electronics ($50-$200):");
// Add a price filter to demonstrate range queries on the same data.
const affordableElectronics = db.products
  .find({
    category: "Electronics",
    price: { $gte: 50, $lte: 200 },
  })
  .sort({ price: 1 })
  .toArray();

affordableElectronics.forEach((product, index) => {
  print(`${index + 1}. ${product.name} - $${product.price}`);
});

// Faceted search aggregation
print("\n--- Faceted Search for Electronics ---");
// Run a faceted search to show multiple aggregations over the same match set.
const facetedSearch = db.products
  .aggregate([
    { $match: { category: "Electronics" } },
    {
      $facet: {
        priceRanges: [
          {
            $bucket: {
              groupBy: "$price",
              boundaries: [0, 50, 100, 200, 500, 1000],
              default: "1000+",
              output: { count: { $sum: 1 } },
            },
          },
        ],
        avgPriceBySubcategory: [
          {
            $group: {
              _id: "$subcategory",
              avgPrice: { $avg: "$price" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        topRated: [
          { $sort: { "ratings.average": -1 } },
          { $limit: 3 },
          { $project: { name: 1, price: 1, ratings: 1 } },
        ],
      },
    },
  ])
  .toArray()[0];

print("Price Distribution:");
facetedSearch.priceRanges.forEach((range) => {
  print(`  $${range._id}: ${range.count} products`);
});

print("\nTop Rated Electronics:");
facetedSearch.topRated.forEach((product, index) => {
  print(`  ${index + 1}. ${product.name} - Rating: ${product.ratings.average}/5`);
});

// ========================================================================
// Additional Queries
// ========================================================================
print("\n█".repeat(60));
print("ADDITIONAL ANALYTICS");
print("█".repeat(60));

// Customer spending summary
print("\nCustomer CUST001 Analytics:");
const customerSpending = db.orders
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
  .toArray()[0];

if (customerSpending) {
  print("=".repeat(40));
  print(`Total Orders: ${customerSpending.total_orders}`);
  print(`Total Spent: $${customerSpending.total_spent.toFixed(2)}`);
  print(`Average Order Value: $${customerSpending.average_order_value.toFixed(2)}`);
  print(`First Order: ${customerSpending.first_order}`);
  print(`Last Order: ${customerSpending.last_order}`);
}

// Products with low stock
print("\nLow Stock Alert (< 20 units):");
const lowStockProducts = db.products
  .find({ stock_quantity: { $lt: 20 } })
  .sort({ stock_quantity: 1 })
  .toArray();

lowStockProducts.forEach((product) => {
  print(`⚠ ${product.name}: ${product.stock_quantity} units remaining`);
});

// Recent reviews for a product
print("\nRecent Reviews for Product PROD001:");
const recentReviews = db.reviews
  .find({ product_id: "PROD001" })
  .sort({ created_at: -1 })
  .limit(3)
  .toArray();

recentReviews.forEach((review, index) => {
  print(`\n${index + 1}. ${review.title} (${review.rating}/5 stars)`);
  print(`   By: ${review.customer_name}`);
  print(`   Date: ${review.created_at}`);
  print(`   "${review.comment}"`);
});

// Update product ratings (example of how to recalculate)
print("\n--- Recalculating Product Ratings ---");
const ratingUpdate = db.reviews
  .aggregate([
    { $match: { product_id: "PROD001" } },
    {
      $group: {
        _id: "$product_id",
        avg_rating: { $avg: "$rating" },
        review_count: { $sum: 1 },
      },
    },
  ])
  .toArray()[0];

if (ratingUpdate) {
  print(`Product PROD001 Rating Update:`);
  print(`  New Average: ${ratingUpdate.avg_rating.toFixed(1)}/5`);
  print(`  Total Reviews: ${ratingUpdate.review_count}`);

  // This would update the product (commented out to avoid modifying data)
  // db.products.updateOne(
  //     { product_id: "PROD001" },
  //     { $set: {
  //         "ratings.average": Math.round(ratingUpdate.avg_rating * 10) / 10,
  //         "ratings.count": ratingUpdate.review_count
  //     }}
  // );
}

// Find all orders containing a specific product
print("\nOrders containing Product PROD001:");
const ordersWithProduct = db.orders
  .find({ "items.product_id": "PROD001" })
  .sort({ order_date: -1 })
  .toArray();

ordersWithProduct.forEach((order) => {
  const item = order.items.find((i) => i.product_id === "PROD001");
  print(`  ${order.order_id} - ${order.order_date} - Qty: ${item.quantity}`);
});

// ========================================================================
// Query Performance Check (using explain)
// ========================================================================
print("\n█".repeat(60));
print("QUERY PERFORMANCE ANALYSIS");
print("█".repeat(60));

// Check if indexes are being used
const explainResult = db.orders
  .explain("executionStats")
  .find({ customer_id: "CUST001" })
  .sort({ order_date: -1 });

print("\nIndex Usage for Customer Orders Query:");
print("=".repeat(40));
if (explainResult.executionStats) {
  print(`Execution Time: ${explainResult.executionStats.executionTimeMillis}ms`);
  print(`Documents Examined: ${explainResult.executionStats.totalDocsExamined}`);
  print(`Documents Returned: ${explainResult.executionStats.nReturned}`);

  const stage = explainResult.executionStats.executionStages;
  if (stage.stage === "COLLSCAN") {
    print(`⚠ Warning: Using COLLSCAN (no index) - Consider adding index on customer_id`);
  } else {
    print(`✓ Using index scan`);
  }
}

// Check collection stats
const stats = db.orders.stats();
print("\nOrders Collection Statistics:");
print(`  Document Count: ${stats.count}`);
print(`  Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
print(`  Average Doc Size: ${stats.avgObjSize} bytes`);
print(`  Indexes: ${stats.nindexes}`);

print("\n" + "=".repeat(60));
print("✓ All queries executed successfully!");
print("=".repeat(60));
