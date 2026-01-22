/* eslint-disable */
// Switch to the airbnb database
db = db.getSiblingDB("airbnb");

/**
 * USE CASE: "Central Stays & Quality Assurance"
 * * * User Story:
 * "As a traveler planning a trip to Porto, I want to find listings located 
 * within a 5km radius of the main city square (Avenida dos Aliados). 
 * For each result, I need to see the host's identity and the top 3 best reviews 
 * immediately, so I can validate the property's quality without browsing 
 * individual detail pages."
 * * * Technical Goal:
 * Execute a high-performance "Geospatial Discovery" query. We prioritize the 
 * spatial filter ($geoNear using 2dsphere index) to drastically reduce the 
 * working dataset first. Then, we perform cascading $lookup joins to enrich 
 * the result with Host metadata and a subset of Reviews (sorted and limited 
 * via an internal pipeline) to optimize read throughput.
 */

const centerPoint = [-8.6104, 41.1488]; // Avenida dos Aliados

const centralListingsWithReviews = db.listings.aggregate([
  {
    // Start here to reduce the dataset immediately
    $geoNear: {
      near: { type: "Point", coordinates: centerPoint },
      distanceField: "distance_from_center", // Output field for distance
      maxDistance: 5000, // 5km radius
      key: "location",
      spherical: true
    }
  },
  {
    // Get the Host details
    $lookup: {
      from: "hosts",
      localField: "host_id",
      foreignField: "id",
      as: "host_doc"
    }
  },
  {
    // Flatten the host array (since 1 listing = 1 host)
    $unwind: "$host_doc"
  },
  {
    // Get Top 3 Highest Rated
    $lookup: {
      from: "reviews",
      let: { local_id: "$id" },
      pipeline: [
        { 
          // Match reviews for this listing
          $match: { 
            $expr: { $eq: ["$listing_id", "$$local_id"] } 
          } 
        },
        { 
          // Sort by Rating (5.0 -> 1.0)
          $sort: { rating: -1, date: -1 } 
        },
        { 
          // Limit to Top 3
          $limit: 3 
        },
        {
          // Clean up review output
          $project: { 
            _id: 0, 
            reviewer: "$reviewer_name", 
            rating: 1, 
            comment: "$comments" 
          }
        }
      ],
      as: "top_reviews"
    }
  },
  {
    // FORMAT OUTPUT
    $project: {
      _id: 0,
      listing_name: "$name",
      // Convert distance to km and round
      distance_km: { $round: [{ $divide: ["$distance_from_center", 1000] }, 2] },
      host_name: "$host_doc.name",
      avg_rating: "$review_scores_rating", // Using the listing's pre-calculated avg
      top_3_reviews: "$top_reviews"
    }
  },
  {
    // Limit result set for readability in console
    $limit: 3
  }
]);

print("--- CENTRAL LISTINGS (With Host & Top 3 Reviews) ---");
printjson(centralListingsWithReviews);