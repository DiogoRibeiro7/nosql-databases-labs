// Bucket listing ratings into ranges.
// Usage: mongosh queries/10_rating_buckets.mongosh.js

db = db.getSiblingDB("staybook");
print("Rating bucket distribution:");

db.listings
  .aggregate([
    { $match: { review_scores_rating: { $type: "number" } } },
    {
      $bucket: {
        groupBy: "$review_scores_rating",
        boundaries: [0, 3.5, 4.0, 4.5, 5.1],
        default: "out_of_range",
        output: { listings: { $sum: 1 } },
      },
    },
    { $sort: { _id: 1 } },
  ])
  .forEach((doc) => printjson(doc));
