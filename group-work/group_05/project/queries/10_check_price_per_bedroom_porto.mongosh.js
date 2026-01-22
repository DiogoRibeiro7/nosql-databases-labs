/* eslint-disable */
/**
 * USE CASE: "Check room value"
 * * * User Story:
 * "As a user with a numerous family wants to check wich listing brings a better value by room number compared to the price in Porto."
 * * * Technical Goal:
 * Perform a project to calculate the price/room value of each listing by dividing the two values and sorting by lowest first',
 */
db = db.getSiblingDB("group_05_final");

const value = db.listings.aggregate([
  { $match: { name: /Porto/ } },
  {
    $project: {
      _id: 0,
      name: 1,
      pricePerBedroom: {
        $divide: [{ $toInt: { $trim: { input: "$price", chars: "€" } } }, "$bedrooms"],
      },
    },
  },
  { $sort: { pricePerBedroom: 1 } },
]);

print(value);
