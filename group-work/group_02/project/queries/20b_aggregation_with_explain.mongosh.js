// Query 20b: Aggregation Performance WITH Indexes
// Part 2 of 2 - Compares optimized performance against Query 20 baseline
// Automatically recreates indexes via index_blueprint.mongosh.js
// Usage: mongosh queries/20b_aggregation_with_explain.mongosh.js

// Load and execute index blueprint to ensure indexes exist
print("\n=== Loading Index Blueprint ===\n");
load("queries/index_blueprint.mongosh.js");

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Complex Aggregation with Execution Statistics (WITH indexes) ===\n");

const pipeline = [
  // Filter recent rentals (uses idx_rental_date_desc index)
  {
    $match: {
      rental_date: { $gte: new Date("2005-05-01"), $lte: new Date("2006-02-28") },
      "payment.amount": { $gte: 0.99 },
    },
  },
  // Lookup customer details (uses idx_customer_id_unique)
  {
    $lookup: {
      from: "customers",
      localField: "customer.customer_id",
      foreignField: "customer_id",
      as: "customer_details",
    },
  },
  // Unwind customer details
  { $unwind: { path: "$customer_details", preserveNullAndEmptyArrays: true } },
  // Group by store and category
  {
    $group: {
      _id: {
        store_id: "$store_id",
        category: "$film.category",
        customer_country: "$customer_details.address.city.country",
      },
      revenue: { $sum: "$payment.amount" },
      rentals: { $sum: 1 },
      unique_customers: { $addToSet: "$customer.customer_id" },
    },
  },
  // Add computed fields
  {
    $project: {
      _id: 1,
      revenue: 1,
      rentals: 1,
      unique_customers_count: { $size: "$unique_customers" },
      avg_revenue_per_rental: { $divide: ["$revenue", "$rentals"] },
    },
  },
  { $sort: { revenue: -1 } },
  { $limit: 10 },
];

print("Aggregation results:");
db.rentals.aggregate(pipeline).forEach((doc) => printjson(doc));

// Execute with explain for execution statistics
const explain = db.rentals.explain("executionStats").aggregate(pipeline);

let stats = explain.executionStats;
if (!stats && Array.isArray(explain.stages)) {
  // fallback for explain shape variations
  const cursorStage = explain.stages.find((stage) => stage.$cursor && stage.$cursor.executionStats);
  if (cursorStage) {
    stats = cursorStage.$cursor.executionStats;
  }
}

print("\nExecution statistics:");
if (stats) {
  print(`  Execution time (ms): ${stats.executionTimeMillis}`);
  print(`  Documents examined: ${stats.totalDocsExamined}`);
  print(`  Keys examined: ${stats.totalKeysExamined}`);
} else {
  print("  Statistics not available for this version.");
}

print("\n✓ Query executed successfully\n");
