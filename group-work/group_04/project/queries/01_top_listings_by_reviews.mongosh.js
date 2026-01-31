// Query 01: Top 10 Listings by Number of Reviews
// Identifies most popular properties for marketing insights
// Usage : mongosh queries/01_top_listings_by_reviews.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Top 10 Listings by Number of Reviews ===\n");

db.listings
  .aggregate([
    {
      $project: {
        _id: 0,
        listing_id: 1,
        name: 1,
        neighbourhood: "$location.neighbourhood",
        room_type: 1,
        price: 1,
        number_of_reviews: "$reviews.number_of_reviews",
        review_scores_rating: "$reviews.review_scores_rating"
      }
    },
    // Sort by reviews descending
    { $sort: { number_of_reviews: -1 } },
    // Top 10
    { $limit: 10 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
