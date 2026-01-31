// Analisa o volume de encomendas não finalizadas por restaurante

db = db.getSiblingDB("food_express");

print("--- Delivery Backlog Analysis (Orders not yet delivered) ---");

db.orders.aggregate([
  // Filtra apenas encomendas que ainda não foram entregues
  { 
    $match: { 
      status: { $in: ["processing", "shipped"] } 
    } 
  },
  // Junta informação do restaurante associada a cada encomenda
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
     // Agrupa encomendas por restaurante
    $group: {
      _id: "$restaurantInfo.name",
      // Número total de encomendas pendentes
      pendingOrders: { $sum: 1 },
      // Valor médio das encomendas pendentes
      avgOrderValue: { $avg: "$totalPrice" },
      // Data da encomenda pendente mais antiga
      oldestPendingOrder: { $min: "$createdAt" }
    }
  },

  // Ordena os restaurantes com mais encomendas pendentes primeiro
  { 
    $sort: { pendingOrders: -1 } 
  },

  //Resultado final
  {
    $project: {
      _id: 0,
      restaurant: "$_id",
      pendingOrders: 1,
      averageValue: { $round: ["$avgOrderValue", 2] },
      oldestOrderDate: "$oldestPendingOrder"
    }
  }
  // Imprime cada documento no terminal
]).forEach((doc) => printjson(doc));



