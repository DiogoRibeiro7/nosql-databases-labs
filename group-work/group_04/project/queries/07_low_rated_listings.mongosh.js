// Query 07: Low-Rated Listings (Rating < 4.0)
// Quality control and improvement opportunities
// Usage : mongosh queries/07_low_rated_listings.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Low-Rated Listings (Rating < 4.0) ===\n");

db.listings
  .find(
    {
      "reviews.review_scores_rating": { $lt: 4.0 },
      "reviews.number_of_reviews": { $gt: 0 }
    },
    {
      _id: 0,
      listing_id: 1,
      name: 1,
      host: 1,
      neighbourhood: "$location.neighbourhood",
      room_type: 1,
      price: 1,
      review_scores_rating: "$reviews.review_scores_rating",
      number_of_reviews: "$reviews.number_of_reviews"
    }
  )
  .sort({ "reviews.review_scores_rating": 1 })
  .limit(20)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
