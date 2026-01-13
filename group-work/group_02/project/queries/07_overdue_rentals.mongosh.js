// Query 07: Alugueres em Atraso
// Gestão de risco via find() com filtros temporais
// Usage: mongosh queries/07_overdue_rentals.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Alugueres em Atraso (>7 dias sem devolução) ===\n");

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

db.rentals
  .find(
    {
      return_date: null,
      rental_date: { $lt: sevenDaysAgo }
    },
    {
      _id: 0,
      rental_id: 1,
      rental_date: 1,
      "customer.customer_id": 1,
      "customer.full_name": 1,
      "film.title": 1,
      store_id: 1
    }
  )
  .sort({ rental_date: 1 })
  // .limit(20)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");