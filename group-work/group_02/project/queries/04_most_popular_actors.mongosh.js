// Query 04: Atores Mais Populares (por Número de Alugueres)
// Identifica atores cujos filmes geram mais rentals via lookup
// Usage: mongosh queries/04_most_popular_actors.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 10 Atores Mais Populares ===\n");

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

// Timing the aggregation (run on rentals collection)
const start = Date.now();
const results = db.rentals.aggregate(pipeline).toArray();
const durationMs = Date.now() - start;

// Print results and timing
results.forEach((doc) => printjson(doc));
print(`\nExecution time: ${durationMs} ms\n`);

print("\n✓ Query executada com sucesso\n");