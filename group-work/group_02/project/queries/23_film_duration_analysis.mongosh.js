// Query 23: Film Duration Analysis by Category
// Length statistics per category using bucket
// Usage: mongosh queries/23_film_duration_analysis.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Film Duration Analysis by Category ===\n");

db.films
  .aggregate([
    // Group by category
    {
      $group: {
        _id: "$category.name",
        film_count: { $sum: 1 },
        avg_length: { $avg: "$length" },
        min_length: { $min: "$length" },
        max_length: { $max: "$length" },
        avg_rental_rate: { $avg: "$rental_rate" },
        avg_replacement_cost: { $avg: "$replacement_cost" }
      }
    },
    // Sort by average length descending
    { $sort: { avg_length: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
