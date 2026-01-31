// Computes total revenue and order count for a specific restaurant.
// Usage: mongosh queries/11_revenue_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Revenue and order count for restaurant ");
db.orders
  .aggregate([
    { $match: { restaurantId: ObjectId("7a42b136e2ea484f9396503a"), status: "delivered" } },
    {
      $group: {
        _id: "$restaurantId",
        totalRevenue: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 }
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
        restaurantName: "$restaurant.name",
        totalRevenue: 1,
        orderCount: 1
      }
    }
  ])
  .forEach((doc) => printjson(doc));