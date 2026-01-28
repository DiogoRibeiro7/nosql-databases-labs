// Query 09: Most Profitable Listings
// Revenue leaders identification
// Usage: mongosh queries/09_most_profitable_listings.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Top 15 Most Profitable Listings ===\n");

db.bookings
  .aggregate([
    // Only completed bookings
    { $match: { status: "completed" } },
    // Group by listing
    {
      $group: {
        _id: "$listing_id",
        listing_name: { $first: "$listing_name" },
        total_revenue: { $sum: "$total_price" },
        booking_count: { $sum: 1 },
        total_nights: { $sum: "$nights" },
        avg_revenue_per_booking: { $avg: "$total_price" }
      }
    },
    // Sort by revenue descending
    { $sort: { total_revenue: -1 } },
    // Top 15
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
