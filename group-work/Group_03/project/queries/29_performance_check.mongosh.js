// Query 29: Performance Check
// Query name: Performance Check
// Query question: What are basic performance stats and an example explain plan?
// Business purpose: validate indexes and identify slow queries early
// Usage: mongosh performance_check.mongosh.js

db = db.getSiblingDB("group_03_airbnb");
print("=== PERFORMANCE CHECK ===");

print("-- Collection stats --");
printjson(db.listings.stats());
printjson(db.bookings.stats());

print("-- Indexes (listings) --");
printjson(db.listings.getIndexes());

print("-- Example explain for a price-sorted query --");
const explain = db.listings
  .find({ "pricing.daily_price": { $gte: 0 } })
  .sort({ "pricing.daily_price": 1 })
  .limit(5)
  .explain("executionStats");
printjson({ executionStats: explain.executionStats ? explain.executionStats : explain });

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
