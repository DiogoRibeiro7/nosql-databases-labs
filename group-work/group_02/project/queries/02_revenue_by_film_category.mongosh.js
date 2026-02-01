// Query 02: Total Revenue by Film Category
// Financial performance analysis by cinematographic genre
// Usage: mongosh queries/02_revenue_by_film_category.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Total Revenue by Film Category ===\n");

db.rentals
  .aggregate([
    {
      $group: {
        _id: "$film.category",
        total_rentals: { $sum: 1 },
        total_revenue: { $sum: "$payment.amount" },
        avg_revenue: { $avg: "$payment.amount" }
      }
    },
    // Sort by revenue descending
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");