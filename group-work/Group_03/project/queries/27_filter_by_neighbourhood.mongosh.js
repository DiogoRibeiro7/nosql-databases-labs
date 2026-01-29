// Query 27: Filter by Neighbourhood
// Query name: Filter by Neighbourhood
// Query question: How to list listings within a given neighbourhood?
// Business purpose: support localized search and inventory discovery
// Usage: mongosh filter_by_neighbourhood.mongosh.js

db = db.getSiblingDB("group_03_airbnb");
print("=== FILTER: BY NEIGHBOURHOOD ===");

const neighbourhood = "Alfama"; // change as needed
db.listings
  .find(
    { "location.neighbourhood": neighbourhood },
    { name: 1, "pricing.daily_price": 1, "details.room_type": 1, _id: 0 }
  )
  .sort({ "pricing.daily_price": 1 })
  .limit(50)
  .forEach((d) => printjson(d));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
