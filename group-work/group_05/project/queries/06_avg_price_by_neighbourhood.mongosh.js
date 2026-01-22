/* eslint-disable */
/**
 * USE CASE: "Neighbourhoods prices destribution"
 * * * User Story:
 * "As a market analyst, I want to analyze the most and least expensive neighbourhoods of Porto."
 * * * Technical Goal:
 * Perform a match for listings in Porto by a regex. Calculate the average price grouped by neighbourhood',
 */
db = db.getSiblingDB("group_05_final");

const avgPrice = db.listings.aggregate([
  { $match: { name: /Porto/ } },
  {
    $group: {
      _id: "$neighbourhood",
      neighbourhoodAverage: { $avg: { $toInt: { $trim: { input: "$price", chars: "€" } } } },
    },
  },
  { $project: { _id: 0, neighbourhoodAverage: 1, neighbourhoodName: "$_id" } },
]);

print(avgPrice);
