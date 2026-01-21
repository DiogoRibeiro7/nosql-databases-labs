// Switch to the airbnb database
db = db.getSiblingDB("airbnb");
/**
 * USE CASE: "Best Value Group Stays"
 * * User Story:
 * "As a user traveling with a group of friends on a budget, I want to find
 * the top 5 listings that offer the best combination of high capacity,
 * high ratings, and low price, regardless of the specific district."
 * * * Technical Goal:
 * compute a derived "Value Score" field for every document using arithmetic
 * operators ($divide, $multiply), then use this custom metric to sort and
 * retrieve the top 5 highest-ranking flat documents.
 */
const bestValueListings = db.airbnb_data
  .aggregate([
    {
      // Clean the price field
      $set: {
        numeric_price: {
          $toDouble: {
            $trim: {
              input: "$price",
              chars: "€", // Remove the "€" character if exists
            },
          },
        },
      },
    },
    {
      // Filter valid listings
      $match: {
        numeric_price: { $gt: 0 },
        review_scores_rating: { $gte: 4.5 },
      },
    },
    {
      // Calculate Value Score (Capacity * Rating / Price)
      $project: {
        _id: 0,
        name: 1,
        price: 1,
        numeric_price: 1,
        review_scores_rating: 1,
        accommodates: 1,
        value_score: {
          $divide: [{ $multiply: ["$review_scores_rating", "$accommodates"] }, "$numeric_price"],
        },
      },
    },
    {
      $sort: { value_score: -1 },
    },
    {
      $limit: 5,
    },
  ])
  .toArray();

print("Top 5 Best Value Listings:");
print(bestValueListings);
