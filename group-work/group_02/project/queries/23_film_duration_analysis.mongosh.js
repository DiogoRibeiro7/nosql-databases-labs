// Query 23: Análise de Duração de Filmes por Categoria
// Estatísticas de length por categoria usando bucket
// Usage: mongosh queries/23_film_duration_analysis.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Análise de Duração de Filmes por Categoria ===\n");

db.films
  .aggregate([
    // Agrupar por categoria
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
    // Ordenar por duração média descendente
    { $sort: { avg_length: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");
