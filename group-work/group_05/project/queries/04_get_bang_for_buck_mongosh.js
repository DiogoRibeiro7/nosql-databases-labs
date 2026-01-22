/* eslint-disable */
// Switch to the airbnb database
db = db.getSiblingDB("airbnb");

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

const bestValueListings = db.listings.aggregate([
  {
    // Clean the price field
    // The data is stored as strings ("€50"), so we must strip the symbol 
    // and convert to a number for math operations.
    $addFields: {
      numeric_price: {
        $toDouble: {
          $trim: {
            input: "$price",
            chars: "€" // explicit character removal
          }
        }
      }
    }
  },
  {
    // Ensure data quality
    // We only want listings with a valid price and high ratings (4.5+)
    $match: {
      numeric_price: { $gt: 0 },
      review_scores_rating: { $gte: 4.5 }
    }
  },
  {
    // Compute the custom "Value Score"
    // Formula: (Rating * Capacity) / Price
    // A higher score means you get "more quality & space per euro".
    $project: {
      _id: 0,
      name: 1,
      formatted_price: "$price",
      rating: "$review_scores_rating",
      capacity: "$accommodates",
      // Calculate and round the score for readability
      value_score: {
        $round: [
          { 
            $divide: [ 
              { $multiply: ["$review_scores_rating", "$accommodates"] }, 
              "$numeric_price" 
            ] 
          }, 
          2 
        ]
      }
    }
  },
  {
    // Highest value first
    $sort: { value_score: -1 }
  },
  {
    // Top 5 results
    $limit: 5
  }
])

print("Top 5 Best Value Listings:");
printjson(bestValueListings);