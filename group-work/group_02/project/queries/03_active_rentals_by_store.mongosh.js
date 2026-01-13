// Query 03: Alugueres Ativos por Loja
// Monitorização operacional de inventário alugado
// Usage: mongosh queries/03_active_rentals_by_store.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Alugueres Ativos (Não Devolvidos) por Loja ===\n");

db.rentals
  .aggregate([
    // Filtrar alugueres sem data de devolução
    { $match: { return_date: null } },
    // Agrupar por loja
    {
      $group: {
        _id: "$store_id",
        active_count: { $sum: 1 },
        expected_revenue: { $sum: "$payment.amount" }
      }
    },
    // Ordenar por loja
    { $sort: { _id: 1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");