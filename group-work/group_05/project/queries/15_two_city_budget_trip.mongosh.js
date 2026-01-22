/* eslint-disable */

db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Multi-City Budget Trip"
 * USER STORY: "I am planning to stay in Porto
 * for a few days and then travel to Lisbon.
 * I do not care about the specific location
 * within either city. I will stay two days in
 * Porto and three days in Lisbon, and I want the
 * combined total price of both Airbnb stays, using
 * private rooms, not to exceed 250 euros."
 * TECHNICAL GOAL: get cheapest option per city and sum total cost.
 */

const query = db.listings.aggregate([
  { $lookup: { from: "hosts", localField: "host_id", foreignField: "id", as: "h" } },
  { $unwind: "$h" },
  {
    $addFields: {
      city: { $trim: { input: { $arrayElemAt: [{ $split: ["$h.location", ","] }, 0] } } },
      price_num: { $toDouble: { $trim: { input: "$price", chars: "€" } } },
    },
  },
  { $match: { city: { $in: ["Porto", "Lisbon"] }, room_type: "Private room" } },
  {
    $facet: {
      porto: [
        { $match: { city: "Porto" } },
        { $sort: { price_num: 1 } },
        { $limit: 1 },
        { $addFields: { nights: 2, total_price: { $multiply: ["$price_num", 2] } } },
      ],
      lisbon: [
        { $match: { city: "Lisbon" } },
        { $sort: { price_num: 1 } },
        { $limit: 1 },
        { $addFields: { nights: 3, total_price: { $multiply: ["$price_num", 3] } } },
      ],
    },
  },
  {
    $project: {
      porto: { $arrayElemAt: ["$porto", 0] },
      lisbon: { $arrayElemAt: ["$lisbon", 0] },
      total_trip_cost: {
        $add: [
          { $arrayElemAt: ["$porto.total_price", 0] },
          { $arrayElemAt: ["$lisbon.total_price", 0] },
        ],
      },
    },
  },
  { $addFields: { within_budget: { $lte: ["$total_trip_cost", 250] } } },
]);

print(query);
