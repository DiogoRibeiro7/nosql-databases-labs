// Query 03: Listings by Room Type Distribution
// Property portfolio analysis
// Usage : mongosh queries/03_room_type_distribution.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Listings by Room Type ===\n");

db.listings
  .aggregate([
    // Group by room type
    {
      $group: {
        _id: "$room_type",
        count: { $sum: 1 },
        avg_price: { $avg: "$price" },
        avg_rating: { $avg: "$reviews.review_scores_rating" },
        total_capacity: { $sum: "$capacity.accommodates" }
      }
    },
    // Calculate percentage
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
        room_types: { $push: "$$ROOT" }
      }
    },
    { $unwind: "$room_types" },
    {
      $project: {
        _id: 0,
        room_type: "$room_types._id",
        count: "$room_types.count",
        percentage: {
          $multiply: [{ $divide: ["$room_types.count", "$total"] }, 100]
        },
        avg_price: "$room_types.avg_price",
        avg_rating: "$room_types.avg_rating",
        total_capacity: "$room_types.total_capacity"
      }
    },
    { $sort: { count: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
