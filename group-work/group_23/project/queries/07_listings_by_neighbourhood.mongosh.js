// Listing filters by neighbourhood and capacity.
// Usage: mongosh queries/07_listings_by_neighbourhood.mongosh.js

db = db.getSiblingDB("staybook");
print("Listings in selected neighbourhoods (sample):");

db.listings
  .find(
    { neighbourhood: { $in: ["Cedofeita", "Alfama"] }, accommodates: { $gte: 2 } },
    { _id: 0, id: 1, name: 1, neighbourhood: 1, room_type: 1, accommodates: 1, price: 1, price_eur: 1 }
  )
  .sort({ accommodates: -1 })
  .limit(10)
  .forEach((doc) => printjson(doc));
