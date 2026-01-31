// Basic listing filters (neighbourhood, price, capacity).
// Usage: mongosh queries/01_listings_filters.mongosh.js

db = db.getSiblingDB("staybook");
print("Sample listing filters (top results):");

// 1) Affordable listings with capacity >= 2 (requires price_eur if available)
db.listings
  .find(
    { price_eur: { $lte: 80 }, accommodates: { $gte: 2 } },
    { _id: 0, id: 1, name: 1, neighbourhood: 1, room_type: 1, price: 1, price_eur: 1, accommodates: 1 }
  )
  .sort({ price_eur: 1 })
  .limit(10)
  .forEach((doc) => printjson(doc));

// 2) High-rated listings with at least some reviews
print("Top-rated listings (min 1 review):");
db.listings
  .find(
    { number_of_reviews: { $gt: 0 } },
    { _id: 0, id: 1, name: 1, neighbourhood: 1, review_scores_rating: 1, number_of_reviews: 1, price_eur: 1 }
  )
  .sort({ review_scores_rating: -1, number_of_reviews: -1 })
  .limit(10)
  .forEach((doc) => printjson(doc));
