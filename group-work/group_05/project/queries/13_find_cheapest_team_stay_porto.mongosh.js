/* eslint-disable */

db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Low-Budget Corporate Team Stay"
 * USER STORY: "My manager assigned me the responsibility of
 * arranging accommodation for a team of six employees on a 
 * business trip to Porto. Since the company is going through 
 * a difficult financial period, I need to pay only what is strictly 
 * necessary, meaning the lowest possible cost. The team will stay 
 * between three and five days. I need an Airbnb in Porto with a 
 * minimum stay between three and five nights that can accommodate 
 * six people and is as cheap as possible."
 * TECHNICAL GOAL: join listings->hosts to filter Porto, then sort by price.
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
  {
    $match: {
      city: "Porto",
      accommodates: { $gte: 6 },
      minimum_nights: { $gte: 3, $lte: 5 },
    },
  },
  { $sort: { price_num: 1 } },
  { $limit: 1 },
]);

print(query);
