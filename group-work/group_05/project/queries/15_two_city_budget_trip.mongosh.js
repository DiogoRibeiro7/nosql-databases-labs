/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Multi-City Budget Trip"
 * USER STORY: "I am planning a trip: 2 days in Porto, then 3 days in Lisbon.
 * I need the cheapest 'Private room' in each city.
 * CONSTRAINT: The combined total price for both stays must not exceed 250 euros."
 * * TECHNICAL GOAL:
 * Use $facet to independently find the cheapest listing in each city,
 * calculate the respective stay costs (Price * Nights), sum them up,
 * and verify against the budget.
 */

print("--- Multi-City Trip Plan (Porto + Lisbon) ---");

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
        // Extract city from "Porto, Portugal"
        city: {
          $trim: {
            input: { $arrayElemAt: [{ $split: ["$host_info.location", ","] }, 0] },
          },
        },
      },
    },
    {
      // Pre-filter for relevant data to speed up Facet
      $match: {
        city: { $in: ["Porto", "Lisbon"] },
        room_type: "Private room",
        price: { $gt: 0 },
      },
    },
    {
      // Run parallel searches
      $facet: {
        porto_option: [
          { $match: { city: "Porto" } },
          { $sort: { price: 1 } }, // Cheapest first
          { $limit: 1 },
          {
            $project: {
              name: 1,
              price: 1,
              city: 1,
              nights: { $literal: 2 },
              stay_cost: { $multiply: ["$price", 2] }, // 2 Nights
            },
          },
        ],
        lisbon_option: [
          { $match: { city: "Lisbon" } },
          { $sort: { price: 1 } }, // Cheapest first
          { $limit: 1 },
          {
            $project: {
              name: 1,
              price: 1,
              city: 1,
              nights: { $literal: 3 },
              stay_cost: { $multiply: ["$price", 3] }, // 3 Nights
            },
          },
        ],
      },
    },
    {
      // Consolidate and Calculate Total
      $project: {
        porto_stay: { $arrayElemAt: ["$porto_option", 0] },
        lisbon_stay: { $arrayElemAt: ["$lisbon_option", 0] },
      },
    },
    {
      $addFields: {
        total_trip_cost: { $add: ["$porto_stay.stay_cost", "$lisbon_stay.stay_cost"] },
      },
    },
    {
      $addFields: {
        budget_status: {
          $cond: {
            if: { $lte: ["$total_trip_cost", 250] },
            then: "Within Budget",
            else: "Over Budget",
          },
        },
      },
    },
  ])
  .forEach(printjson);
