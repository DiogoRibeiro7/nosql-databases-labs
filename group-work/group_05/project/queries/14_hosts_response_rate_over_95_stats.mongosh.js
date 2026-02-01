/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Host Performance Screening"
 * USER STORY: "My company needs to analyze Airbnb host data.
 * I need to find 'Top Responders' (Response Rate > 95%),
 * count their total listings and reviews, and calculate the
 * average rating across all their properties."
 * * TECHNICAL GOAL:
 * 1. Parse 'response_rate' ("98%") to Number (98).
 * 2. Filter Hosts (> 95).
 * 3. Join Listings (1 Host -> Many Listings).
 * 4. Join Reviews (1 Listing -> Many Reviews).
 * 5. Group by Host to aggregate stats.
 */

print("--- Top Performing Hosts (Response Rate > 95%) ---");

db.hosts
  .aggregate([
    {
      // Parse string "100%" to number 100 for filtering
      $addFields: {
        response_rate_num: {
          $toInt: { $trim: { input: "$response_rate", chars: "%" } },
        },
      },
    },
    {
      // Filter for High Response Rates
      $match: { response_rate_num: { $gt: 95 } },
    },
    {
      // Join with Listings
      $lookup: {
        from: "listings",
        localField: "id",
        foreignField: "host_id",
        as: "listings",
      },
    },
    {
      // Unwind to process each listing individually
      $unwind: "$listings",
    },
    {
      // Join with Reviews
      $lookup: {
        from: "reviews",
        localField: "listings.id",
        foreignField: "listing_id",
        as: "reviews",
      },
    },
    {
      // Group back to Host level
      $group: {
        _id: "$id",
        host_name: { $first: "$name" },
        response_rate: { $first: "$response_rate" },

        // Count unique listings
        listings_count: { $sum: 1 },

        // Average of all their properties' ratings
        avg_property_rating: { $avg: "$listings.review_scores_rating" },

        // Sum of the size of the reviews array for each listing
        total_reviews: { $sum: { $size: "$reviews" } },
      },
    },
    {
      // Format Output
      $project: {
        _id: 0,
        host_name: 1,
        response_rate: 1,
        listings_count: 1,
        total_reviews: 1,
        // Round rating for readability
        avg_property_rating: { $round: ["$avg_property_rating", 2] },
      },
    },
    {
      $sort: { total_reviews: -1 },
    },
    { $limit: 10 }, // Limit to top 10 for console readability
  ])
  .forEach(printjson);
