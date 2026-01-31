// Query 11: Host Performance Metrics
// Host evaluation and ranking
// Usage: mongosh queries/11_host_performance_metrics.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Host Performance Metrics ===\n");

db.bookings
  .aggregate([
    // Only completed bookings
    { $match: { status: "completed" } },
    // Group by host
    {
      $group: {
        _id: "$host_id",
        total_bookings: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
        total_nights: { $sum: "$nights" },
        avg_booking_value: { $avg: "$total_price" },
        unique_listings: { $addToSet: "$listing_id" }
      }
    },
    // Add computed fields
    {
      $project: {
        host_id: "$_id",
        total_bookings: 1,
        total_revenue: 1,
        total_nights: 1,
        avg_booking_value: 1,
        listings_with_bookings: { $size: "$unique_listings" },
        avg_revenue_per_night: { $divide: ["$total_revenue", "$total_nights"] }
      }
    },
    // Sort by revenue descending
    { $sort: { total_revenue: -1 } },
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
