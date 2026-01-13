// Query 11: Métricas de Performance de Staff
// Avaliação de desempenho de funcionários via agregação
// Usage: mongosh queries/11_staff_performance_metrics.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Métricas de Performance de Staff ===\n");

db.rentals
  .aggregate([
    // Agrupar por staff e loja
    {
      $group: {
        _id: { staff_id: "$staff_id", store_id: "$store_id" },
        total_rentals: { $sum: 1 },
        total_revenue: { $sum: "$payment.amount" },
        avg_transaction: { $avg: "$payment.amount" }
      }
    },
    // Ordenar por receita descendente
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");