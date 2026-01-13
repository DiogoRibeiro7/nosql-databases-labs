// Query 02: Receita Total por Categoria de Filme
// Análise de performance financeira por género cinematográfico
// Usage: mongosh queries/02_revenue_by_film_category.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Receita Total por Categoria de Filme ===\n");

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
    // Ordenar por receita descendente
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");