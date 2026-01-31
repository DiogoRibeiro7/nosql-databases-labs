/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Low-Budget Corporate Team Stay"
 * USER STORY: "My manager assigned me the responsibility of arranging accommodation
 * for a team of six employees on a business trip to Porto.
 * Constraints:
 * 1. Location: Porto
 * 2. Capacity: 6 people
 * 3. Min Stay Rule: Between 3 and 5 nights (inclusive)
 * 4. Goal: Lowest possible cost.
 */

print("--- Cheapest Corporate Stay (Porto, 6 People, 3-5 Night Rule) ---");

db.listings
  .aggregate([
    {
      $lookup: {
        from: "hosts",
        localField: "host_id",
        foreignField: "id",
        as: "host_info",
      },
    },
    { $unwind: "$host_info" },
    {
      $addFields: {
        // Parse "Porto" from "Porto, Portugal"
        city: {
          $trim: {
            input: { $arrayElemAt: [{ $split: ["$host_info.location", ","] }, 0] },
          },
        },
      },
    },
    {
      $match: {
        city: "Porto",
        accommodates: { $gte: 6 },
        // Check if the listing allows a stay duration appropriate for the trip
        minimum_nights: { $gte: 3, $lte: 5 },
        price: { $gt: 0 },
      },
    },
    {
      // Sort by Price Ascending (Cheapest first)
      $sort: { price: 1 },
    },
    { $limit: 1 },
    {
      // Format output
      $project: {
        _id: 0,
        name: 1,
        price: 1,
        accommodates: 1,
        minimum_nights: 1,
        location: "$city",
      },
    },
  ])
  .forEach(printjson);
