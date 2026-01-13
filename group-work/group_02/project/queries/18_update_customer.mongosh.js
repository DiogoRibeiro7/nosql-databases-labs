// Query 18: Atualizar Dados de Cliente (UPDATE)
// Demonstra operação de atualização parcial
// Usage: mongosh queries/18_update_customer.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Atualizar Cliente Existente ===\n");

const TARGET_CUSTOMER_ID = 1;

print("Estado antes da atualização:");
db.customers
  .find(
    { customer_id: TARGET_CUSTOMER_ID },
    { _id: 0, customer_id: 1, first_name: 1, last_name: 1, lifetime_rentals: 1, last_update: 1 }
  )
  .forEach((doc) => printjson(doc));

// Atualizar timestamp e incrementar contador de alugueres
const updateResult = db.customers.updateOne(
  { customer_id: TARGET_CUSTOMER_ID },
  {
    $set: {
      last_update: new Date()
    },
    $inc: {
      lifetime_rentals: 1
    }
  }
);

print("\nResultado da atualização:");
printjson(updateResult);

print("\nEstado após a atualização:");
db.customers
  .find(
    { customer_id: TARGET_CUSTOMER_ID },
    { _id: 0, customer_id: 1, first_name: 1, last_name: 1, lifetime_rentals: 1, last_update: 1 }
  )
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");
