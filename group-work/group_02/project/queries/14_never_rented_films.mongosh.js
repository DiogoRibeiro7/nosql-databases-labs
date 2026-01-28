// Query 14: Never Rented Films
// Identifies dead inventory via lookup between films and rentals
// Usage: mongosh queries/14_never_rented_films.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Films without Rental History ===\n");

db.films
  .aggregate([
    // Join with rentals
    {
      $lookup: {
        from: "rentals",
        localField: "film_id",
        foreignField: "film.film_id",
        as: "rental_history"
      }
    },
    // Filter films without rentals
    { $match: { rental_history: { $size: 0 } } },
    // Join with inventory to count copies
    {
      $lookup: {
        from: "inventory",
        localField: "film_id",
        foreignField: "film_id",
        as: "inventory_items"
      }
    },
    // Project final fields
    {
      $project: {
        film_id: 1,
        title: 1,
        category: "$category.name",
        rating: 1,
        rental_rate: 1,
        inventory_count: { $size: "$inventory_items" }
      }
    },
    // Sort by copies descending
    { $sort: { inventory_count: -1, title: 1 } },
    { $limit: 25 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");