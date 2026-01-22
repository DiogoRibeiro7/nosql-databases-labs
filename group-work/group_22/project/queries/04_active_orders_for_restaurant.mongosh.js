// Lists orders for a specific restaurant whose status is not delivered (e.g., processing or shipped).
// Usage: mongosh queries/04_active_orders_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Active (undelivered) orders for restaurant ");
db.orders
  .aggregate([
    { $match: { restaurantId: ObjectId("7a42b136e2ea484f9396503a"), status: { $ne: "delivered" } } },
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
      $project: {
        _id: 0,
        restaurantName: "$restaurant.name",
        orderNumber: 1,
        totalPrice: 1,
        status: 1,
        createdAt: 1
      }
    }
  ])
  .sort({ createdAt: -1 })
  .forEach((doc) => printjson(doc));