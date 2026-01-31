// Groups delivered orders by day and sums totalPrice per day for a specific restaurant.
// Usage: mongosh queries/12_daily_revenue_trend_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Daily revenue trend for restaurant ");
db.orders
  .aggregate([
    { $match: { restaurantId: ObjectId("7a42b136e2ea484f9396503a"), status: "delivered" } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          restaurantId: "$restaurantId"
        },
        dailyRevenue: { $sum: "$totalPrice" },
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
        date: "$_id.date",
        dailyRevenue: 1,
        orderCount: 1
      }
    },
    { $sort: { date: 1 } }
  ])
  .forEach((doc) => printjson(doc));