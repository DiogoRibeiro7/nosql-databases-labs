// Query 10: Temporal Rental Patterns by Month
// Seasonal analysis for inventory planning
// Usage: mongosh queries/10_rental_patterns_by_month.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Rental Patterns by Month ===\n");

db.rentals
  .aggregate([
    // Extract year and month from rental date
    {
      $project: {
        year: { $year: "$rental_date" },
        month: { $month: "$rental_date" },
        payment_amount: "$payment.amount"
      }
    },
    // Group by year/month
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment_amount" },
        avg_rental_value: { $avg: "$payment_amount" }
      }
    },
    // Sort chronologically
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");