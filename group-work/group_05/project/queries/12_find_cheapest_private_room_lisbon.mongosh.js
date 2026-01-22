/* eslint-disable */

db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Emergency Family Stay"
 * USER STORY: "My family (my wife and daughter) 
 * and I missed the train we were supposed to take back 
 * home. We are currently in Lisbon and have very little money. 
 * I want to find the cheapest possible Airbnb that is a private 
 * room with two beds."
 * TECHNICAL GOAL: join listings->hosts to filter Lisbon, then sort by price.
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
      city: "Lisbon",
      room_type: "Private room",
      beds: { $gte: 2 },
    },
  },
  { $sort: { price_num: 1 } },
  { $limit: 1 },
]);

print(query);
