// Bucket listings into price ranges (requires price_eur).
// Usage: mongosh queries/09_price_buckets.mongosh.js

db = db.getSiblingDB("staybook");
print("Price bucket distribution (EUR):");

db.listings
  .aggregate([
    { $match: { price_eur: { $exists: true } } },
    {
      $bucket: {
        groupBy: "$price_eur",
        boundaries: [0, 50, 80, 120, 200, 100000],
        default: "out_of_range",
        output: { listings: { $sum: 1 } },
      },
    },
    { $sort: { _id: 1 } },
  ])
  .forEach((doc) => printjson(doc));
