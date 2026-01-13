// Query 26: Atualização em Massa (Bulk Update)
// Demonstra updateMany para operações em lote
// Usage: mongosh queries/26_bulk_update_inventory.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Atualização em Massa de Inventário ===\n");

// Contar inventário por estado antes
print("Estado antes da atualização:");
db.inventory
  .aggregate([
    {
      $group: {
        _id: "$available",
        count: { $sum: 1 }
      }
    }
  ])
  .forEach((doc) => printjson(doc));

// Marcar todo inventário da loja 1 como disponível
const updateResult = db.inventory.updateMany(
  { store_id: 1, available: false },
  {
    $set: {
      available: true,
      last_update: new Date()
    }
  }
);

print("\nResultado da atualização:");
printjson(updateResult);

print("\n✓ Query executada com sucesso\n");
