/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Listing performance scoring"
 * * * User Story:
 * "As a user, I want to know which listings are more popular."
 * * * Technical Goal:
 * Classify listings into High/Medium/Low demand.
 * CRITICAL FIX: We calculate 'demandRank' (3, 2, 1) to sort correctly,
 * because sorting by string "High"/"Medium" acts alphabetically (wrong order).
 */

print("--- Listings Ranked by Demand (High -> Low) ---");

db.listings
  .aggregate([
    {
      $project: {
        _id: 0,
        name: 1,
        neighbourhood: 1,
        availability_365: 1,
        number_of_reviews: 1,
        // Numeric Rank for Sorting (High=3, Medium=2, Low=1)
        demandRank: {
          $switch: {
            branches: [
              {
                // High Demand
                case: {
                  $and: [{ $lt: ["$availability_365", 121] }, { $gt: ["$number_of_reviews", 50] }],
                },
                then: 3,
              },
              {
                // Medium Demand
                case: {
                  $or: [
                    {
                      $and: [
                        { $gte: ["$availability_365", 121] },
                        { $lte: ["$availability_365", 242] },
                      ],
                    },
                    {
                      $and: [
                        { $gte: ["$number_of_reviews", 10] },
                        { $lte: ["$number_of_reviews", 50] },
                      ],
                    },
                  ],
                },
                then: 2,
              },
            ],
            default: 1, // Low Demand
          },
        },
      },
    },
    {
      $addFields: {
        demand_label: {
          $switch: {
            branches: [
              { case: { $eq: ["$demandRank", 3] }, then: "High" },
              { case: { $eq: ["$demandRank", 2] }, then: "Medium" },
            ],
            default: "Low",
          },
        },
      },
    },
    // Sort by the Rank
    { $sort: { demandRank: -1 } },

    // Clean up output
    { $project: { demandRank: 0 } },

    // Limit for readability
    { $limit: 10 },
  ])
  .forEach(printjson);
