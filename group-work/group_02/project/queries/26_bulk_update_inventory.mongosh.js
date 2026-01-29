// Query 26: Bulk Update
// Demonstrates updateMany for batch operations
// Usage: mongosh queries/26_bulk_update_inventory.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Bulk Inventory Update ===\n");

// Count inventory by status before
print("State before update:");
db.inventory
  .aggregate([
    {
      $group: {
        _id: "$available",
        count: { $sum: 1 },
      },
    },
  ])
  .forEach((doc) => printjson(doc));

// Mark all store 1 inventory as available
const updateResult = db.inventory.updateMany(
  { store_id: 1, available: false },
  {
    $set: {
      available: true,
      last_update: new Date(),
    },
    $unset: { current_rental_id: "" },
  }
);

print("\nUpdate result:");
printjson(updateResult);

print("\n✓ Query executed successfully\n");
