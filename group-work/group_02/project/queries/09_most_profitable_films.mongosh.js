// Query 09: Top 15 Most Profitable Films
// Identifies high-performance catalog via aggregation
// Usage: mongosh queries/09_most_profitable_films.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 15 Most Profitable Films ===\n");

db.rentals
  .aggregate([
    // Group by film
    {
      $group: {
        _id: "$film.film_id",
        title: { $first: "$film.title" },
        category: { $first: "$film.category" },
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment.amount" }
      }
    },
    // Calculate average revenue per rental
    {
      $addFields: {
        avg_revenue_per_rental: { $divide: ["$total_revenue", "$rental_count"] }
      }
    },
    // Sort by revenue descending
    { $sort: { total_revenue: -1 } },
    // Top 15
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");