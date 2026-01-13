// Query 12: Clientes Inativos (sem alugueres recentes)
// Identificação de oportunidades de re-engagement
// Usage: mongosh queries/12_inactive_customers.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Clientes Inativos (sem rentals antes de 2005-12-31) ===\n");

const inactiveThreshold = new Date("2005-12-31");

db.rentals
  .aggregate([
    // Agrupar por cliente
    {
      $group: {
        _id: "$customer.customer_id",
        customer_name: { $first: "$customer.full_name" },
        customer_email: { $first: "$customer.email" },
        last_rental_date: { $max: "$rental_date" },
        total_rentals: { $sum: 1 },
        lifetime_value: { $sum: "$payment.amount" }
      }
    },
    // Filtrar apenas inativos
    { $match: { last_rental_date: { $lt: inactiveThreshold } } },
    // Ordenar por valor descendente
    { $sort: { lifetime_value: -1 } },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");