// For restaurant '7a42b136e2ea484f9396503a', computes the average ordered quantity per dish and lists dishes above this average.
// Usage: mongosh queries/15_items_above_average_order_rate_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Items with above-average order rate for restaurant ");
db.order_items
  .aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order"
      }
    },
    { $unwind: "$order" },
    { $match: { "order.restaurantId": ObjectId("7a42b136e2ea484f9396503a") } },
    {
      $group: {
        _id: { restaurantId: "$order.restaurantId", item: "$name" },
        totalQty: { $sum: "$qty" }
      }
    },
    {
      $group: {
        _id: "$_id.restaurantId",
        items: { $push: { item: "$_id.item", totalQty: "$totalQty" } },
        avgQty: { $avg: "$totalQty" }
      }
    },
    { $unwind: "$items" },
    { $match: { $expr: { $gt: ["$items.totalQty", "$avgQty"] } } },
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
        restaurantName: "$restaurant.name",
        item: "$items.item",
        totalQty: "$items.totalQty",
        avgQty: 1
      }
    }
  ])
  .forEach((doc) => printjson(doc));