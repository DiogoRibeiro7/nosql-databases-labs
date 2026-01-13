// Query 25: Filmes com Mais Atores
// Análise de elenco usando $size em arrays embedded
// Usage: mongosh queries/25_films_with_most_actors.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 15 Filmes com Maior Elenco ===\n");

db.films
  .aggregate([
    // Calcular tamanho do elenco
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
    // Ordenar por número de atores
    { $sort: { actor_count: -1 } },
    // Top 15
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");
