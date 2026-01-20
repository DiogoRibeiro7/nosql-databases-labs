// Query 25: CRUD Delete Example
// Query name: CRUD Delete Example
// Query question: How to delete listings for a test host and cascade remove bookings?
// Business purpose: demonstrate safe delete patterns and cleanup for test data
// Usage: mongosh crud_delete.mongosh.js

db = db.getSiblingDB("group_03_airbnb");
print("=== CRUD: DELETE ===");

// Example: delete listings for a test host and cascade remove bookings
const hostId = "host_crud_1";
const listings = db.listings.find({ "host.id": hostId }).toArray();
if (listings.length === 0) {
  print(`No listings found for host ${hostId}`);
} else {
  const ids = listings.map((l) => l._id);
  const dres = db.listings.deleteMany({ _id: { $in: ids } });
  printjson(dres);

  const bdel = db.bookings.deleteMany({ listing_id: { $in: ids } });
  printjson(bdel);
}

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
