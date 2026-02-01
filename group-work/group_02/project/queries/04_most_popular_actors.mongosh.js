// Query 04: Most Popular Actors (by Number of Rentals)
// Identifies actors whose films generate more rentals via lookup
// Usage: mongosh queries/04_most_popular_actors.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 10 Most Popular Actors ===\n");

// 1) Aggregate rentals -> inventory to compute rentals per film, then join to films and aggregate by actor
const pipeline = [
  // map rentals -> inventory to get film_id per rental
  { $lookup: { from: "inventory", localField: "inventory_id", foreignField: "inventory_id", as: "inv" } },
  { $unwind: "$inv" },
  // count rentals per film
  { $group: { _id: "$inv.film_id", rentals_count: { $sum: 1 } } },

  // join counts into films to access actors
  { $lookup: { from: "films", localField: "_id", foreignField: "film_id", as: "film" } },
  { $unwind: "$film" },
  { $unwind: "$film.actors" },

  // aggregate rentals per actor
  {
    $group: {
      _id: {
        actor_id: "$film.actors.actor_id",
        actor_name: { $concat: ["$film.actors.first_name", " ", "$film.actors.last_name"] }
      },
      total_rentals: { $sum: "$rentals_count" },
      films_count: { $sum: 1 }
    }
  },

  { $sort: { total_rentals: -1 } },
  { $limit: 10 }
];


const results = db.rentals.aggregate(pipeline).toArray();

results.forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");