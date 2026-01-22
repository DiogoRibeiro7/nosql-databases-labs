/* eslint-disable */
/**
 * USE CASE: "Listing performance scoring"
 * * * User Story:
 * "As a user, I want to know wich listing are more popular."
 * * * Technical Goal:
 * Perform a switch case, labeling listings by their yearly availability and number of user reviews, through three different branches and sorting for most rented listings',
 */

db = db.getSiblingDB("group_05_final");

const rating = db.listings.aggregate([
  {
    $project: {
      _id: 0,
      name: 1,
      neighbourhood: 1,
      availability_365: 1,
      number_of_reviews: 1,
      demand: {
        $switch: {
          branches: [
            {
              case: {
                $and: [{ $lt: ["$availability_365", 121] }, { $gt: ["$number_of_reviews", 50] }],
              },
              then: "High",
            },
            {
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
              then: "Medium",
            },
          ],
          default: "Low",
        },
      },
    },
  },
  { $sort: { demand: -1 } },
]);

print(rating);
