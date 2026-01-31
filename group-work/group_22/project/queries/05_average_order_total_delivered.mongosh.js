// Calculates the average totalPrice of delivered orders for a specific restaurant.
// Usage: mongosh queries/05_average_order_total_delivered.mongosh.js

db = db.getSiblingDB("group_22");
print("Average order total for delivered orders ");
db.orders
  .aggregate([
    // Filter for the specific restaurant and only delivered orders.
    {
      $match: {
        restaurantId: ObjectId("7a42b136e2ea484f9396503a"),
        status: "delivered"
      }
    },
    // Compute the average totalPrice across all matching orders.
    {
      $group: {
        _id: "$restaurantId",
        averageTotalPrice: { $avg: "$totalPrice" }
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
        averageTotalPrice: 1
      }
    }
  ])
  .forEach((doc) => printjson(doc));