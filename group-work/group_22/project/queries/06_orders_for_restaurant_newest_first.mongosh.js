// Lists all orders belonging to a restaurant, sorted by createdAt descending.
// Usage: mongosh queries/06_orders_for_restaurant_newest_first.mongosh.js

db = db.getSiblingDB("group_22");
print("Orders for restaurant ");
db.orders
  .aggregate([
    { $match: { restaurantId: ObjectId("7a42b136e2ea484f9396503a") } },
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