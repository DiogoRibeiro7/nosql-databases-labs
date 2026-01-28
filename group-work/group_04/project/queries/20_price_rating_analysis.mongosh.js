// Query 20: Price vs Rating Correlation Analysis
// Analyzes relationship between price ranges and guest ratings
// Usage: mongosh queries/20_price_rating_analysis.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Price vs Rating Correlation Analysis ===\n");

db.listings
  .aggregate([
    // Filter only listings with reviews
    { $match: { "reviews.number_of_reviews": { $gt: 0 } } },
    // Bucket by price ranges
    {
      $bucket: {
        groupBy: "$price",
        boundaries: [
          NumberDecimal("0"),
          NumberDecimal("50"),
          NumberDecimal("75"),
          NumberDecimal("100"),
          NumberDecimal("125"),
          NumberDecimal("150"),
          NumberDecimal("200"),
          NumberDecimal("500"),
        ],
        default: "500+",
        output: {
          count: { $sum: 1 },
          avg_rating: { $avg: "$reviews.review_scores_rating" },
          min_rating: { $min: "$reviews.review_scores_rating" },
          max_rating: { $max: "$reviews.review_scores_rating" },
          total_reviews: { $sum: "$reviews.number_of_reviews" },
          avg_reviews_per_listing: { $avg: "$reviews.number_of_reviews" },
          sample_listings: {
            $push: { name: "$name", price: "$price", rating: "$reviews.review_scores_rating" },
          },
        },
      },
    },
    // Format output
    {
      $project: {
        price_range: "$_id",
        count: 1,
        avg_rating: { $round: ["$avg_rating", 2] },
        min_rating: 1,
        max_rating: 1,
        total_reviews: 1,
        avg_reviews_per_listing: { $round: ["$avg_reviews_per_listing", 1] },
        sample_listings: { $slice: ["$sample_listings", 3] },
      },
    },
    { $sort: { _id: 1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n--- Summary Statistics ---\n");

// Calculate overall correlation summary
const summary = db.listings
  .aggregate([
    { $match: { "reviews.number_of_reviews": { $gt: 0 } } },
    {
      $group: {
        _id: null,
        total_listings_with_reviews: { $sum: 1 },
        overall_avg_rating: { $avg: "$reviews.review_scores_rating" },
        overall_avg_price: { $avg: "$price" },
        high_rated_count: {
          $sum: { $cond: [{ $gte: ["$reviews.review_scores_rating", 4.5] }, 1, 0] },
        },
        budget_high_rated: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lte: ["$price", NumberDecimal("75")] },
                  { $gte: ["$reviews.review_scores_rating", 4.5] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total_listings_with_reviews: 1,
        overall_avg_rating: { $round: ["$overall_avg_rating", 2] },
        overall_avg_price: { $round: ["$overall_avg_price", 2] },
        high_rated_count: 1,
        budget_high_rated: 1,
        high_rated_percentage: {
          $round: [
            {
              $multiply: [{ $divide: ["$high_rated_count", "$total_listings_with_reviews"] }, 100],
            },
            1,
          ],
        },
      },
    },
  ])
  .toArray()[0];

printjson(summary);

print("\n✓ Query executed successfully\n");
