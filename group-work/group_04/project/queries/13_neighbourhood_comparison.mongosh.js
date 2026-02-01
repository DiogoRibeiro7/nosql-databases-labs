// Query 13: Neighbourhood Comparison Metrics
// Geographic performance dashboard
// Usage: mongosh queries/13_neighbourhood_comparison.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Performance Comparison by Neighbourhood ===\n");

db.listings
  .aggregate([
    // Group by neighbourhood
    {
      $group: {
        _id: "$location.neighbourhood",
        total_listings: { $sum: 1 },
        avg_price: { $avg: "$price" },
        avg_rating: { $avg: "$reviews.review_scores_rating" },
        total_reviews: { $sum: "$reviews.number_of_reviews" },
        total_capacity: { $sum: "$capacity.accommodates" },
        avg_availability: { $avg: "$booking_rules.availability_365" }
      }
    },
    // Calculate reviews per listing
    {
      $project: {
        neighbourhood: "$_id",
        total_listings: 1,
        avg_price: { $round: ["$avg_price", 2] },
        avg_rating: { $round: ["$avg_rating", 2] },
        total_reviews: 1,
        reviews_per_listing: {
          $round: [{ $divide: ["$total_reviews", "$total_listings"] }, 2]
        },
        total_capacity: 1,
        avg_availability: { $round: ["$avg_availability", 0] }
      }
    },
    // Sort by listing count
    { $sort: { total_listings: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
