// For a restaurant, lists menu items whose total ordered quantity is below the average quantity per item.
// Usage: mongosh queries/13_underperforming_menu_items_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Underperforming menu items for restaurant (below average quantity):");
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
    { $match: { $expr: { $lt: ["$items.totalQty", "$avgQty"] } } },
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