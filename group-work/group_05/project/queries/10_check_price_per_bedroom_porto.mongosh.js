/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Check Room Value (Family Budget)"
 * * * User Story:
 * "As a user with a large family, I want to find which listing in Porto offers
 * the best value per bedroom (Lowest Price / Number of Bedrooms)."
 * * * Technical Goal:
 * Calculate a computed field 'pricePerBedroom' using arithmetic division.
 * We must ensure we don't divide by zero (studios with 0 bedrooms).
 */

print("--- Best Value Listings per Bedroom (Porto) ---");

db.listings
  .aggregate([
    {
      $match: {
        name: /Porto/,
        bedrooms: { $gt: 0 },
        price: { $gt: 0 },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        bedrooms: 1,
        price: 1,
        pricePerBedroom: {
          // We round to 2 decimals for cleaner output
          $round: [{ $divide: ["$price", "$bedrooms"] }, 2],
        },
      },
    },
    {
      // Lowest cost per room first
      $sort: { pricePerBedroom: 1 },
    },
    {
      // Limit to top 10 for readability
      $limit: 10,
    },
  ])
  .forEach(printjson);
