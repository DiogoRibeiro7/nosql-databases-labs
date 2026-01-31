// For each restaurant, finds which dishes are ordered the most by quantity, limited to top 3 per restaurant.
// Usage: mongosh queries/10_top_n_dishes_by_quantity_per_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Top 3 dishes by total quantity for each restaurant:");
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
    {
      $group: {
        _id: { restaurantId: "$order.restaurantId", item: "$name" },
        totalQty: { $sum: "$qty" }
      }
    },
    {
      $sort: { "_id.restaurantId": 1, totalQty: -1 }
    },
    {
      $group: {
        _id: "$_id.restaurantId",
        topDishes: { $push: { item: "$_id.item", totalQty: "$totalQty" } }
      }
    },
    {
      $project: {
        topDishes: { $slice: ["$topDishes", 3] }
      }
    }
  ])
  .forEach((doc) => printjson(doc));