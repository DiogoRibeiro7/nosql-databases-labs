// Analisa o volume de encomendas não finalizadas por restaurante

db = db.getSiblingDB("food_express");

print("--- Delivery Backlog Analysis (Orders not yet delivered) ---");

db.orders.aggregate([
  { 
    $match: { 
      status: { $in: ["processing", "shipped"] } 
    } 
  },
  {
    $lookup: {
      from: "restaurants",
      localField: "restaurantId",
      foreignField: "_id",
      as: "restaurantInfo"
    }
  },
  { $unwind: "$restaurantInfo" },

  
  {
    $group: {
      _id: "$restaurantInfo.name",
      pendingOrders: { $sum: 1 },
      avgOrderValue: { $avg: "$totalPrice" },
      oldestPendingOrder: { $min: "$createdAt" }
    }
  },

  { 
    $sort: { pendingOrders: -1 } 
  },

  {
    $project: {
      _id: 0,
      restaurant: "$_id",
      pendingOrders: 1,
      averageValue: { $round: ["$avgOrderValue", 2] },
      oldestOrderDate: "$oldestPendingOrder"
    }
  }
]).forEach((doc) => printjson(doc));



