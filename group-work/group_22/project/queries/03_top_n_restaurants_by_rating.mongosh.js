// Shows the top 5 best-rated restaurants across the whole platform.
// Usage: mongosh queries/03_top_n_restaurants_by_rating.mongosh.js

db = db.getSiblingDB("group_22");
print("Top 5 restaurants by rating:");
db.restaurants
  .find({}, { _id: 0, name: 1, type: 1, rating: 1 })
  .sort({ rating: -1 })
  .limit(5)
  .forEach((doc) => printjson(doc));