// Query 20b: Complex Aggregation with Indexes
// Performance comparison with indexes applied
// Usage: mongosh queries/20b_aggregation_with_explain.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Complex Aggregation: Revenue by Neighbourhood (WITH INDEXES) ===\n");

// First, ensure indexes are created
print("Creating/ensuring indexes exist...\n");
load("queries/index_blueprint.mongosh.js");

print("\n=== Running Aggregation with Index Support ===\n");

const pipeline = [
  // Only completed bookings
  { $match: { status: "completed" } },
  // Lookup listing details
  {
    $lookup: {
      from: "listings",
      localField: "listing_id",
      foreignField: "listing_id",
      as: "listing"
    }
  },
  { $unwind: "$listing" },
  // Group by neighbourhood
  {
    $group: {
      _id: "$listing.location.neighbourhood",
      revenue: { $sum: "$total_price" },
      bookings: { $sum: 1 },
      total_nights: { $sum: "$nights" },
      unique_guests: { $addToSet: "$guest.guest_id" },
      unique_listings: { $addToSet: "$listing_id" }
    }
  },
  // Add computed fields
  {
    $project: {
      _id: 1,
      revenue: 1,
      bookings: 1,
      total_nights: 1,
      unique_guests_count: { $size: "$unique_guests" },
      unique_listings_count: { $size: "$unique_listings" },
      avg_revenue_per_booking: { $divide: ["$revenue", "$bookings"] },
      avg_nights_per_booking: { $divide: ["$total_nights", "$bookings"] }
    }
  },
  { $sort: { revenue: -1 } },
  { $limit: 10 }
];

print("Aggregation results:");
db.bookings.aggregate(pipeline).forEach((doc) => printjson(doc));

// Execute with explain for execution statistics
print("\n=== Execution Statistics (WITH INDEXES) ===\n");
const explainResult = db.bookings.explain("executionStats").aggregate(pipeline);

const execStats = explainResult.stages ? explainResult.stages[0].$cursor.executionStats : explainResult.executionStats;

printjson({
  executionTimeMillis: execStats.executionTimeMillis,
  totalDocsExamined: execStats.totalDocsExamined,
  totalKeysExamined: execStats.totalKeysExamined,
  nReturned: execStats.nReturned
});

print("\n✓ Query executed successfully\n");
print("Compare these results with Query 20 (without indexes) to see performance improvement.\n");
