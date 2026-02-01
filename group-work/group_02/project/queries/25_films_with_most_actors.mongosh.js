// Query 25: Films with Most Actors
// Cast analysis using $size on embedded arrays
// Usage: mongosh queries/25_films_with_most_actors.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 15 Films with Largest Cast ===\n");

db.films
  .aggregate([
    // Calculate cast size
    {
      $project: {
        _id: 0,
        film_id: 1,
        title: 1,
        category: "$category.name",
        rating: 1,
        actor_count: { $size: { $ifNull: ["$actors", []] } }
      }
    },
    // Sort by number of actors
    { $sort: { actor_count: -1 } },
    // Top 15
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
