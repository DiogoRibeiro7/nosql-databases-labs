// Query 10: Padrões Temporais de Alugueres por Mês
// Análise sazonal para planeamento de inventário
// Usage: mongosh queries/10_rental_patterns_by_month.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Padrões de Alugueres por Mês ===\n");

db.rentals
  .aggregate([
    // Extrair ano e mês da data de aluguer
    {
      $project: {
        year: { $year: "$rental_date" },
        month: { $month: "$rental_date" },
        payment_amount: "$payment.amount"
      }
    },
    // Agrupar por ano/mês
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment_amount" },
        avg_rental_value: { $avg: "$payment_amount" }
      }
    },
    // Ordenar cronologicamente
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");