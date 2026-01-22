// Lists all open restaurants in a given city, returning basic info like name, cuisine type, and rating.
// Usage: mongosh queries/01_open_restaurants_in_city.mongosh.js

db = db.getSiblingDB("group_22");
print("Open restaurants in Toulouse:");
db.restaurants
  .find(
    { "address.city": "Toulouse", open: true },
    { _id: 0, name: 1, type: 1, rating: 1 }
  )
  .sort({ rating: -1 })
  .forEach((doc) => printjson(doc));