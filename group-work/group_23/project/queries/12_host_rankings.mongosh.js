// Host rankings: hosts with most listings (dataset-level).
// Usage: mongosh queries/12_host_rankings.mongosh.js

db = db.getSiblingDB("staybook");
print("Hosts with most listings:");

db.listings
  .aggregate([
    {
      $group: {
        _id: { host_id: "$host_id", host_name: "$host_name" },
        totalListings: { $sum: 1 },
        avgRating: { $avg: "$review_scores_rating" },
      },
    },
    { $sort: { totalListings: -1 } },
    { $limit: 10 },
  ])
  .forEach((doc) => printjson(doc));
