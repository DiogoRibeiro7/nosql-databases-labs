// For restaurant '7a42b136e2ea484f9396503a', extracts hour-of-day from createdAt for delivered orders and finds the hours with the highest number of orders.
// Usage: mongosh queries/18_peak_ordering_hours_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Peak ordering hours for restaurant ");
db.orders
  .aggregate([
    { $match: { restaurantId: ObjectId("7a42b136e2ea484f9396503a"), status: "delivered" } },
    {
      $group: {
        _id: { restaurantId: "$restaurantId", hour: { $hour: "$createdAt" } },
        orderCount: { $sum: 1 }
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
        hour: "$_id.hour",
        orderCount: 1
      }
    },
    { $sort: { orderCount: -1 } }
  ])
  .forEach((doc) => printjson(doc));