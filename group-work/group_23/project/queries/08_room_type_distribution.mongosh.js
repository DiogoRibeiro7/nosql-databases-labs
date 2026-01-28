// Distribution of listings by room type.
// Usage: mongosh queries/08_room_type_distribution.mongosh.js

db = db.getSiblingDB("staybook");
print("Listing count by room type:");

db.listings
  .aggregate([
    { $group: { _id: "$room_type", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ])
  .forEach((doc) => printjson(doc));
