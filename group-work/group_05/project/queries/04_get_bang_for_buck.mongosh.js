/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Best Value Group Stays"
 * * User Story:
 * "As a user traveling with a group of friends on a budget, I want to find
 * the top 5 listings that offer the best combination of high capacity,
 * high ratings, and low price, regardless of the specific district."
 * * * Technical Goal:
 * Compute a derived "Value Score" field for every document using arithmetic
 * operators ($divide, $multiply), then use this custom metric to sort and
 * retrieve the top 5 highest-ranking flat documents.
 */

print("Top 5 Best Value Listings:");

db.listings
  .aggregate([
    {
      // Ensure data quality
      // We only want listings with a valid price and high ratings (4.5+)
      // NOTE: 'price' is now a Number, so we query it directly (no $toDouble needed)
      $match: {
        price: { $gt: 0 },
        review_scores_rating: { $gte: 4.5 },
      },
    },
    {
      // Compute the custom Value Score
      // Formula: (Rating * Capacity) / Price
      // A higher score means you get more quality and space per euro.
      $project: {
        _id: 0,
        name: 1,
        price: 1,
        rating: "$review_scores_rating",
        capacity: "$accommodates",
        // Calculate and round the score for readability
        value_score: {
          $round: [
            {
              // Now using "$price" directly
              $divide: [{ $multiply: ["$review_scores_rating", "$accommodates"] }, "$price"],
            },
            2,
          ],
        },
      },
    },
    {
      // Highest value first
      $sort: { value_score: -1 },
    },
    {
      // Top 5 results
      $limit: 5,
    },
  ])
  .forEach(printjson);
