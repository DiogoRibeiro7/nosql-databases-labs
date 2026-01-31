// For each city, determines which cuisine type has the highest total number of orders.
// Usage: mongosh queries/16_most_popular_cuisine_per_city.mongosh.js

db = db.getSiblingDB("group_22");
print("Most popular cuisine per city (by order count):");
db.orders
  .aggregate([
    { $match: { status: "delivered" } },
    {
      $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    { $unwind: "$restaurant" },
    {
      $group: {
        _id: { city: "$restaurant.address.city", cuisine: "$restaurant.type" },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.city": 1, orderCount: -1 }
    },
    {
      $group: {
        _id: "$_id.city",
        topCuisine: { $first: { cuisine: "$_id.cuisine", orderCount: "$orderCount" } }
      }
    },
    {
      $project: {
        _id: 0,
        city: "$_id",
        cuisine: "$topCuisine.cuisine",
        orderCount: "$topCuisine.orderCount"
      }
    }
  ])
  .forEach((doc) => printjson(doc));