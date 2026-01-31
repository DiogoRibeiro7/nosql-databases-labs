// Query 20: Aggregation Performance WITHOUT Indexes
// Part 1 of 2 - Run this first, then run 20b to compare with indexes
// This script intentionally drops all indexes to establish baseline performance
// Usage: mongosh queries/20_aggregation_with_explain.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Checking and Clearing Existing Indexes ===\n");

const collections = ["films", "customers", "rentals", "inventory", "stores"];
collections.forEach((collName) => {
  try {
    const existingIndexes = db[collName].getIndexes();
    if (existingIndexes.length > 1) {
      print(`${collName}: found ${existingIndexes.length} indexes. Removing...`);
      db[collName].dropIndexes();
      print(`${collName}: indexes removed successfully (except _id)`);
    } else {
      print(`${collName}: only _id index exists (nothing to remove)`);
    }
  } catch (error) {
    print(`${collName}: error removing indexes - ${error.message}`);
  }
});

print("\n=== Complex Aggregation with Execution Statistics (WITHOUT indexes) ===\n");

const pipeline = [
  // Filter recent rentals (NO index usage - collection scan)
  {
    $match: {
      rental_date: { $gte: new Date("2005-05-01"), $lte: new Date("2006-02-28") },
      "payment.amount": { $gte: 0.99 },
    },
  },
  // Lookup customer details
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
// Force a collection scan to measure performance without using any indexes
db.rentals.aggregate(pipeline, { hint: { $natural: 1 } }).forEach((doc) => printjson(doc));

// Execute with explain for execution statistics, forcing collection scan (no indexes)
const explain = db.rentals.explain("executionStats").aggregate(pipeline, { hint: { $natural: 1 } });

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
