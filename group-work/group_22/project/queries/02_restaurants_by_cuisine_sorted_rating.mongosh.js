// Finds restaurants of a given cuisine (Indien) ordered from highest to lowest rating.
// Usage: mongosh queries/02_restaurants_by_cuisine_sorted_rating.mongosh.js

db = db.getSiblingDB("group_22");
print("Indien restaurants sorted by rating (highest first):");
db.restaurants
  .find({ type: "Indien" }, { _id: 0, name: 1, rating: 1, address: 1 })
  .sort({ rating: -1 })
  .forEach((doc) => printjson(doc));