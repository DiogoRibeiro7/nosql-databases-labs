// Query 09: Top 15 Filmes Mais Lucrativos
// Identifica catálogo de alta performance via agregação
// Usage: mongosh queries/09_most_profitable_films.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Top 15 Filmes Mais Lucrativos ===\n");

db.rentals
  .aggregate([
    // Agrupar por filme
    {
      $group: {
        _id: "$film.film_id",
        title: { $first: "$film.title" },
        category: { $first: "$film.category" },
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment.amount" }
      }
    },
    // Calcular receita média por aluguer
    {
      $addFields: {
        avg_revenue_per_rental: { $divide: ["$total_revenue", "$rental_count"] }
      }
    },
    // Ordenar por receita descendente
    { $sort: { total_revenue: -1 } },
    // Top 15
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");