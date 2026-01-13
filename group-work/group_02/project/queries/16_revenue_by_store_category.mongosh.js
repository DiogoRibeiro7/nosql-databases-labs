// Query 16: Receita e Métricas por Loja e Categoria de Filme
// Agrupa rentals por store_id e categoria para análise de performance

// Mostra receita total, contagem de alugueres, tempo médio de aluguer e valor médio por loja/categoria
// Usage: mongosh queries/16_revenue_by_store_category.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Receita e Performance por Loja e Categoria de Filme ===\n");
print("Análise de KPIs agrupados por store_id e categoria de filme:\n");

db.rentals
  .aggregate([
    // Filtrar apenas rentals com payment e categoria definida
    {
      $match: {
        "payment.amount": { $exists: true },
        "film.category": { $exists: true }
      }
    },
    
    // Agrupar por loja e categoria de filme para calcular KPIs
    {
      $group: {
        _id: { 
          store_id: "$store_id", 
          category: "$film.category" 
        },
        revenue: { $sum: "$payment.amount" },
        rentals: { $sum: 1 },
        avgRentalValue: {  $avg: "$payment.amount" },
        avgRentalDurationDays: { $avg: "$rental_duration_days"}
      },
    },
    
    
    // Ordenar descendente para combinações mais lucrativas aparecerem primeiro
    { $sort: { revenue: -1 } },
    
    // Limitar a top 20 combinações
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");