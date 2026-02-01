// For each restaurant, computes the average number of items per delivered order.
// Usage: mongosh queries/19_average_basket_size_per_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Average basket size (items per order) per restaurant:");
db.orders
  .aggregate([
    { $match: { status: "delivered" } },
    {
      $addFields: {
        itemCount: { $size: "$items" }
      }
    },
    {
      $group: {
        _id: "$restaurantId",
        avgBasketSize: { $avg: "$itemCount" }
      }
    },
    {
      $lookup: {
        from: "restaurants",
        localField: "_id",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    { $unwind: "$restaurant" },
    {
      $project: {
        _id: 0,
        name: "$restaurant.name",
        avgBasketSize: 1
      }
    }
  ])
  .forEach((doc) => printjson(doc));