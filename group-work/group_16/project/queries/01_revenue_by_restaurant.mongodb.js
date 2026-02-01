// Qual é a faturação total e o volume de vendas de cada restaurante, por ordem de importância?

// depois de feedback -- group first, put all together after (lookup)

db = db.getSiblingDB("food_express");

print("--- Revenue and order count per restaurant ---");

db.orders.aggregate([
  {
    $group: {
      _id: "$restaurantId",
      revenue: { $sum: "$totalPrice" },
      orders: { $sum: 1 }
    }
  },

  {
    $lookup: {
      from: "restaurants",
      localField: "_id",    
      foreignField: "_id",
      as: "details"
    }
  },

  { $unwind: "$details" },

  { $sort: { revenue: -1 } },

  {
    $project: {
      _id: 0,
      restaurantId: "$_id",
      restaurantName: "$details.name",
      totalRevenue: { $round: ["$revenue", 2] },
      orderCount: "$orders"
    }
  }

]).forEach((doc) => printjson(doc));