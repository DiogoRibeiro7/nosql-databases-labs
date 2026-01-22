// Recreates the recommended indexes.
// Run with: mongosh queries/index_blueprint.mongosh.js

db = db.getSiblingDB("group_22");
print(`Using database: ${db.getName()}`);

print("Applying unique indexes for reference data (skipping docs without the id)...");
// Enforce uniqueness of restaurant identifiers only when `restaurantId` exists and is not null.
printjson(
	db.restaurants.createIndex(
		{ restaurantId: 1 },
		{ unique: true, partialFilterExpression: { restaurantId: { $exists: true } }, name: 'restaurantId_unique' }
	)
);
// Enforce uniqueness of menu item identifiers only when `menuItemId` exists and is not null.
printjson(
	db.menu_items.createIndex(
		{ menuItemId: 1 },
		{ unique: true, partialFilterExpression: { menuItemId: { $exists: true } }, name: 'menuItemId_unique' }
	)
);

print("\nApplying analytics indexes on orders...");
// Compound index ensures the main dashboards (restaurant/time) stay efficient.
printjson(db.orders.createIndex({ restaurantId: 1, createdAt: 1 }, { name: 'restaurant_createdAt_idx' }));
// Customer-level index powers the repeat visitor leaderboard.
printjson(db.orders.createIndex({ "customer.customerId": 1 }, { name: 'customerId_idx' }));

print("\nApplying order_items indexes...");
printjson(db.order_items.createIndex({ orderId: 1 }, { name: 'orderId_idx' }));
printjson(db.order_items.createIndex({ menuItemId: 1 }, { name: 'menuItemId_idx' }));

print("\nDone. Run db.<collection>.getIndexes() to inspect the results.");
