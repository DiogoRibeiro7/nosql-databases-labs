// Query 24: Rentals by Weekday
// Analysis of temporal patterns using date operators
// Usage: mongosh queries/24_rentals_by_weekday.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Rental Patterns by Weekday ===\n");

db.rentals
  .aggregate([
    // Extract day of week and hour
    {
      $project: {
        dayOfWeek: { $dayOfWeek: "$rental_date" },
        payment_amount: "$payment.amount"
      }
    },
    // Group by day of week
    {
      $group: {
        _id: "$dayOfWeek",
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment_amount" },
        avg_revenue: { $avg: "$payment_amount" }
      }
    },
    // Sort by day
    { $sort: { _id: 1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n(1=Sunday, 2=Monday, ..., 7=Saturday)");
print("\n✓ Query executed successfully\n");
