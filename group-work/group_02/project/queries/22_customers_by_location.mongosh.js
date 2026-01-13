// Query 22: Clientes por Cidade e País
// Análise geográfica de distribuição de clientes
// Usage: mongosh queries/22_customers_by_location.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Distribuição de Clientes por Cidade/País ===\n");

db.customers
  .aggregate([
    // Agrupar por país e cidade
    {
      $group: {
        _id: {
          country: "$address.city.country",
          city: "$address.city.city_name"
        },
        customer_count: { $sum: 1 },
        total_lifetime_value: { $sum: "$lifetime_value" },
        avg_rentals: { $avg: "$lifetime_rentals" }
      }
    },
    // Ordenar por contagem descendente
    { $sort: { customer_count: -1 } },
    // Top 15 localizações
    { $limit: 15 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");
