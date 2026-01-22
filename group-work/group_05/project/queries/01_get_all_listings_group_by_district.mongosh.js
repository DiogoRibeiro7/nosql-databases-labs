/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * ==================================================================================
 * USE CASE: "Regional Discovery & Road Trip Planner"
 * ==================================================================================
 * * USER STORY:
 * "As a traveler planning a road trip across Portugal, I want to see a
 * consolidated catalog of apartments grouped by city (e.g., Lisbon, Porto).
 * This allows me to assess availability and average ratings for each destination
 * in a single view, rather than searching for each city individually."
 * * TECHNICAL GOAL:
 * Perform a Join between the 'listings' and 'hosts' collections
 * to resolve the location of each property. Then, dynamically aggregate the
 * flat list into a hierarchical structure (City -> List of Properties).
 * ==================================================================================
 */

const listingsByDistrict = db.listings.aggregate([
  {
    // Link 'listings' to 'hosts' to find the true location
    // We match 'listings.host_id' with 'hosts.id'
    $lookup: {
      from: "hosts",
      localField: "host_id",
      foreignField: "id",
      as: "host_details",
    },
  },
  {
    // Deconstruct the array from the lookup
    $unwind: "$host_details",
  },
  {
    // Parse the city name from the host's "location" string
    // "Porto, Portugal" -> Split by "," -> Take 1st part -> Trim whitespace
    $addFields: {
      derived_city: {
        $trim: {
          input: { $arrayElemAt: [{ $split: ["$host_details.location", ","] }, 0] },
        },
      },
    },
  },
  {
    // Create the hierarchy (City -> Listings)
    $group: {
      _id: "$derived_city",

      // aggregations metrics
      total_properties: { $sum: 1 },
      avg_city_rating: { $avg: "$review_scores_rating" },
      min_price: { $min: "$price" },

      // The actual list of apartments
      catalog: {
        $push: {
          name: "$name",
          neighbourhood: "$neighbourhood",
          room_type: "$room_type",
          price: "$price",
          rating: "$review_scores_rating",
        },
      },
    },
  },
  {
    // Format the final output
    $project: {
      _id: 0,
      destination: "$_id",
      total_properties: 1,
      avg_city_rating: { $round: ["$avg_city_rating", 2] }, // Round to 2 decimals
      min_price: 1,
      catalog: 1,
    },
  },
  {
    // Alphabetical order by Destination
    $sort: { destination: 1 },
  },
]);

printjson(listingsByDistrict);
