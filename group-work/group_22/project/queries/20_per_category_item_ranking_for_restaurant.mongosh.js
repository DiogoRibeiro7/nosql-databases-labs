// For restaurant '7a42b136e2ea484f9396503a' and category 'plat', aggregates delivered orders, sums total quantity per item, and ranks items from most to least ordered.
// Usage: mongosh queries/20_per_category_item_ranking_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Plat item ranking for restaurant (most ordered first):");
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
    { $match: { "order.restaurantId": ObjectId("7a42b136e2ea484f9396503a"), "order.status": "delivered" } },
    {
      $lookup: {
        from: "menu_items",
        localField: "name",
        foreignField: "item",
        as: "menu"
      }
    },
    { $unwind: "$menu" },
    { $match: { "menu.category": "plat" } },
    {
      $group: {
        _id: { restaurantId: "$order.restaurantId", item: "$name" },
        totalQty: { $sum: "$qty" }
      }
    },
    {
      $lookup: {
        from: "restaurants",
        localField: "_id.restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    { $unwind: "$restaurant" },
    {
      $project: {
        _id: 0,
        restaurantName: "$restaurant.name",
        item: "$_id.item",
        totalQty: 1
      }
    },
    { $sort: { totalQty: -1 } }
  ])
  .forEach((doc) => printjson(doc));