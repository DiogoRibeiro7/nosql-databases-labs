// Query 26: CRUD Update Example
// Query name: CRUD Update Example
// Query question: How to update a listing's price and availability by host id?
// Business purpose: demonstrate common update operations for pricing/availability changes

db = db.getSiblingDB("group_03_airbnb");
print("=== CRUD: UPDATE ===");

// Example: update a listing's price and availability by host id
const hostId = "host_crud_1";
const updateResult = db.listings.updateOne(
  { "host.id": hostId },
  { $set: { "pricing.daily_price": 75, "availability.days_available_365": 180 } }
);

printjson(updateResult);

// Show updated document (if any)
const updated = db.listings.findOne({ "host.id": hostId });
printjson(updated);

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
