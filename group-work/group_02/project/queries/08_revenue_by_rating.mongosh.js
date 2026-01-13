// Query 08: Análise de Receita por Rating de Filme
// Avalia preferências de audiência via lookup entre rentals e films
// Usage: mongosh queries/08_revenue_by_rating.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Receita e Alugueres por Rating de Filme ===\n");

db.rentals
  .aggregate([
    // Juntar com filmes para obter rating
    {
      $lookup: {
        from: "films",
        localField: "film.film_id",
        foreignField: "film_id",
        as: "film_details"
      }
    },
    { $unwind: "$film_details" },
    // Agrupar por rating
    {
      $group: {
        _id: "$film_details.rating",
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment.amount" },
        avg_rental_rate: { $avg: "$film_details.rental_rate" }
      }
    },
    // Ordenar por receita descendente
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");