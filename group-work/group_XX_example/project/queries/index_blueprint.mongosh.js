// Recreates the recommended indexes.
// Run with: mongosh queries/index_blueprint.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print(`Using database: ${db.getName()}`);

print("Applying unique indexes for reference data...");
// Enforce uniqueness of vendor identifiers to avoid accidental duplicates.
printjson(db.vendors.createIndex({ vendorId: 1 }, { unique: true }));
// Enforce uniqueness of event codes for the same reason.
printjson(db.events.createIndex({ eventCode: 1 }, { unique: true }));

print("\nApplying analytics indexes on orders...");
// Compound index ensures the main dashboards (event/vendor/time) stay efficient.
printjson(db.orders.createIndex({ eventCode: 1, vendorId: 1, createdAt: 1 }));
// Customer-level index powers the repeat visitor leaderboard.
printjson(db.orders.createIndex({ "customer.customerId": 1 }));

print("\nDone. Run db.<collection>.getIndexes() to inspect the results.");
