// Query 13: Comparação de Métricas entre Lojas
// Dashboard executivo de performance por loja
// Usage: mongosh queries/13_store_comparison_metrics.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Comparação de Performance entre Lojas ===\n");

db.customers
  .aggregate([
    // Agrupar por loja e somar métricas de "lifetime" dos clientes
    {
      $group: {
        _id: "$store_id",
        total_rentals: { $sum: "$lifetime_rentals" },
        total_revenue: { $sum: "$lifetime_value" },
        unique_customers: { $sum: 1 }
      }
    },
    // Formatar saída e calcular média baseada nos totais
    {
      $project: {
        store_id: "$_id",
        total_rentals: 1,
        total_revenue: 1,
        avg_rental_value: {
          $cond: [
            { $eq: ["$total_rentals", 0] },
            0,
            { $divide: ["$total_revenue", "$total_rentals"] }
          ]
        },
        unique_customers: 1
      }
    },
    // Ordenar por lucro total
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");