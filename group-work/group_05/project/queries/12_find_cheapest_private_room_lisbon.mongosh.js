/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Emergency Family Stay"
 * USER STORY: "My family (my wife and daughter) and I missed the train back home.
 * We are currently in Lisbon and have very little money.
 * I want to find the cheapest possible Airbnb that is a Private room with at least two beds."
 * * TECHNICAL GOAL:
 * Join listings -> hosts to filter by City ("Lisbon"), filter by room attributes,
 * and sort by Price Ascending (Cheapest First).
 */

print("--- Cheapest Emergency Stay (Lisbon, Private Room, 2+ Beds) ---");

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
        // Extract city from "Lisbon, Portugal"
        city: {
          $trim: {
            input: { $arrayElemAt: [{ $split: ["$host_info.location", ","] }, 0] },
          },
        },
      },
    },
    {
      $match: {
        city: "Lisbon",
        room_type: "Private room",
        beds: { $gte: 2 },
        price: { $gt: 0 },
      },
    },
    {
      // Sort by Price Ascending (Cheapest first)
      $sort: { price: 1 },
    },
    { $limit: 1 },
    {
      // Clean output for the console
      $project: {
        _id: 0,
        name: 1,
        price: 1,
        beds: 1,
        room_type: 1,
        location: "$city",
      },
    },
  ])
  .forEach(printjson);
