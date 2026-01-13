// Query 19: Remover Cliente de Teste (DELETE)
// Demonstra operação de remoção com verificação
// Usage: mongosh queries/19_delete_test_customer.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Remover Cliente de Teste ===\n");

const TEST_CUSTOMER_ID = 9999;

// Verificar se cliente existe
const customerBefore = db.customers.findOne({ customer_id: TEST_CUSTOMER_ID });

if (!customerBefore) {
  print("Cliente de teste não encontrado. Nada a remover.");
} else {
  print("Cliente encontrado:");
  printjson({
    customer_id: customerBefore.customer_id,
    name: customerBefore.first_name + " " + customerBefore.last_name,
    email: customerBefore.email
  });

  // Remover cliente
  const deleteResult = db.customers.deleteOne({ customer_id: TEST_CUSTOMER_ID });

  print("\nResultado da remoção:");
  printjson(deleteResult);
}

// Confirmar remoção
const customerAfter = db.customers.findOne({ customer_id: TEST_CUSTOMER_ID });
print("\nVerificação pós-remoção:");
print(customerAfter ? "Cliente ainda existe" : "Cliente removido com sucesso");

print("\n✓ Query executada com sucesso\n");
