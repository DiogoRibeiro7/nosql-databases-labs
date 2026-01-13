// Query 24: Rentals por Dia da Semana
// Análise de padrões temporais usando operadores de data
// Usage: mongosh queries/24_rentals_by_weekday.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Padrões de Alugueres por Dia da Semana ===\n");

db.rentals
  .aggregate([
    // Extrair dia da semana e hora
    {
      $project: {
        dayOfWeek: { $dayOfWeek: "$rental_date" },
        payment_amount: "$payment.amount"
      }
    },
    // Agrupar por dia da semana
    {
      $group: {
        _id: "$dayOfWeek",
        rental_count: { $sum: 1 },
        total_revenue: { $sum: "$payment_amount" },
        avg_revenue: { $avg: "$payment_amount" }
      }
    },
    // Ordenar por dia
    { $sort: { _id: 1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n(1=Domingo, 2=Segunda, ..., 7=Sábado)");
print("\n✓ Query executada com sucesso\n");
