// Query 10: Booking Patterns by Month
// Seasonal analysis for pricing optimization
// Usage: mongosh queries/10_booking_patterns_by_month.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Booking Patterns by Month ===\n");

db.bookings
  .aggregate([
    // Extract year and month from check-in date
    {
      $project: {
        year: { $year: "$check_in" },
        month: { $month: "$check_in" },
        total_price: 1,
        nights: 1,
        status: 1
      }
    },
    // Only completed bookings
    { $match: { status: "completed" } },
    // Group by year/month
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        booking_count: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
        total_nights: { $sum: "$nights" },
        avg_booking_value: { $avg: "$total_price" }
      }
    },
    // Sort chronologically
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
