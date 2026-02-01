// Query 13: Store Comparison Metrics
// Executive dashboard of performance by store
// Usage: mongosh queries/13_store_comparison_metrics.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Performance Comparison between Stores ===\n");

db.customers
  .aggregate([
    // Group by store and sum customer lifetime metrics
    {
      $group: {
        _id: "$store_id",
        total_rentals: { $sum: "$lifetime_rentals" },
        total_revenue: { $sum: "$lifetime_value" },
        unique_customers: { $sum: 1 }
      }
    },
    // Format output and calculate average based on totals
    {
      $project: {
        store_id: "$_id",
        total_rentals: 1,
        total_revenue: 1,
        avg_rental_value: {
          $cond: [
            { $eq: ["$total_rentals", 0] },
            0,
            { $divide: ["$total_revenue", "$total_rentals"] }
          ]
        },
        unique_customers: 1
      }
    },
    // Sort by total profit
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");