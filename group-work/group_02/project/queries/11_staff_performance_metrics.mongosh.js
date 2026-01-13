// Query 11: Staff Performance Metrics
// Employee performance evaluation via aggregation
// Usage: mongosh queries/11_staff_performance_metrics.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Staff Performance Metrics ===\n");

db.rentals
  .aggregate([
    // Group by staff and store
    {
      $group: {
        _id: { staff_id: "$staff_id", store_id: "$store_id" },
        total_rentals: { $sum: 1 },
        total_revenue: { $sum: "$payment.amount" },
        avg_transaction: { $avg: "$payment.amount" }
      }
    },
    // Sort by revenue descending
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");