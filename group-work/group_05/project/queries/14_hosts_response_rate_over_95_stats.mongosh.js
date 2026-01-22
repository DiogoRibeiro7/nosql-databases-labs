/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Host Performance Screening"
 * USER STORY: "My company was hired to analyze 
 * Airbnb host data and statistics. As a first step
 * in this analysis, I need to know the percentage 
 * of hosts with a response rate higher than 95%, 
 * the reviews of properties owned by those hosts, 
 * and the average rating of those properties."
 * TECHNICAL GOAL: filter hosts, join to listings and reviews, aggregate per host.
 */

const query = db.hosts.aggregate([
  {
    $addFields: {
      response_rate_num: { $toInt: { $trim: { input: "$response_rate", chars: "%" } } },
    },
  },
  { $match: { response_rate_num: { $gt: 95 } } },
  {
    $lookup: {
      from: "listings",
      localField: "id",
      foreignField: "host_id",
      as: "listings",
    },
  },
  { $unwind: "$listings" },
  {
    $lookup: {
      from: "reviews",
      localField: "listings.id",
      foreignField: "listing_id",
      as: "reviews",
    },
  },
  {
    $group: {
      _id: "$id",
      host_name: { $first: "$name" },
      response_rate: { $first: "$response_rate" },
      listings_count: { $sum: 1 },
      avg_property_rating: { $avg: "$listings.review_scores_rating" },
      total_reviews: { $sum: { $size: "$reviews" } },
    },
  },
  {
    $project: {
      _id: 0,
      host_id: "$_id",
      host_name: 1,
      response_rate: 1,
      listings_count: 1,
      avg_property_rating: 1,
      total_reviews: 1,
    },
  },
]);

print(query);
