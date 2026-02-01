// Performance demo: listings filter + sort using indexes.
// Usage: mongosh advanced/01_listings_price_explain.mongosh.js

db = db.getSiblingDB("staybook");
print("Performance test A: listings filter + sort (price_eur, accommodates)");

const query = { price_eur: { $exists: true, $gte: 30, $lte: 120 }, accommodates: { $gte: 4 } };
const projection = { _id: 0, id: 1, name: 1, price_eur: 1, accommodates: 1, neighbourhood: 1 };
const sort = { price_eur: 1 };

print("Explain BEFORE creating compound index:");
printjson(
  db.listings
    .find(query, projection)
    .sort(sort)
    .limit(20)
    .explain("executionStats")
    .executionStats
);

print("Creating compound index: { accommodates: 1, price_eur: 1 }");
db.listings.createIndex({ accommodates: 1, price_eur: 1 });

print("Explain AFTER creating compound index:");
printjson(
  db.listings
    .find(query, projection)
    .sort(sort)
    .limit(20)
    .explain("executionStats")
    .executionStats
);

print("Done.");
