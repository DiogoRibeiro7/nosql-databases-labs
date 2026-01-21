db = db.getSiblingDB("food_express");
print("Optimizing the engine for: ${db.getName()}");

// Do not allow repeted order numbers.
printjson(db.orders.createIndex({ orderNumber: 1 }, { unique: true }));

// price cheapeast to most expensive and date newest to oldest
printjson(db.orders.createIndex({ totalPrice: 1, createdAt: -1 }));

// restaurantId lowest to biggest
printjson(db.orders.createIndex({ restaurantId: 1 }));

// status alphabetical
printjson(db.orders.createIndex({ status: 1 }));


// adress city ascending and rating biggest to lowest
printjson(db.restaurants.createIndex({ "address.city": 1, rating: -1 }));

//type alphabetical 
printjson(db.restaurants.createIndex({ type: 1 }));

// menu category alphabetical and price cheapest to most expensive
printjson(db.restaurants.createIndex({ "menu.category": 1, "menu.price": 1 }));

print("\nAll performance layers are active. Run 'db.getCollectionNames().forEach(c => printjson(db[c].getIndexes()))' to inspect the results.");