// Query 04: Atores Mais Populares (por Número de Alugueres)
// Identifica atores cujos filmes geram mais rentals via lookup
// Usage: mongosh queries/04_most_popular_actors.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 10 Atores Mais Populares ===\n");

db.films
  .aggregate([
    // Expandir array de atores
    { $unwind: "$actors" },
    // Juntar com rentals para contar alugueres
    {
      $lookup: {
        from: "rentals",
        localField: "film_id",
        foreignField: "film.film_id",
        as: "film_rentals"
      }
    },
    // Agrupar por ator e contar rentals
    {
      $group: {
        _id: {
          actor_id: "$actors.actor_id",
          actor_name: { $concat: ["$actors.first_name", " ", "$actors.last_name"] }
        },
        total_rentals: { $sum: { $size: "$film_rentals" } },
        films_count: { $sum: 1 }
      }
    },
    // Ordenar por alugueres descendente
    { $sort: { total_rentals: -1 } },
    // Top 10
    { $limit: 10 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");