/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Neighbourhood Price Distribution"
 * * * User Story:
 * "As a market analyst, I want to analyze the average pricing across different
 * neighbourhoods in Porto to identify premium vs. budget areas."
 * * * Technical Goal:
 * Filter listings (optional regex context), then group by neighbourhood
 * to calculate the arithmetic mean of the now-numeric 'price' field.
 */

print("--- Average Price by Neighbourhood (Porto) ---");

db.listings
  .aggregate([
    {
      // Filter for listings in "Porto"
      $match: { name: /Porto/ },
    },
    {
      $group: {
        _id: "$neighbourhood",
        neighbourhoodAverage: { $avg: "$price" },
        total_listings: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        neighbourhoodName: "$_id",
        // Round to 2 decimal places for currency formatting
        neighbourhoodAverage: { $round: ["$neighbourhoodAverage", 2] },
        total_listings: 1,
      },
    },
    {
      // Sort by most expensive first
      $sort: { neighbourhoodAverage: -1 },
    },
  ])
  .forEach(printjson);
