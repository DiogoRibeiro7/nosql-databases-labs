// Calcula o preço médio dos itens no menu de cada restaurante.
// depois de feedback professor


db = db.getSiblingDB("food_express");

print("--- Average Menu Pricing by Restaurant (Fixed) ---");

db.restaurants.aggregate([

  { $unwind: "$menu" },

  //agrupa pelo id agora
  {
    $group: {
      _id: "$_id", 
      restaurantName: { $first: "$name" },
      avgPrice: { $avg: "$menu.price" },
      totalItems: { $sum: 1 }
    }
  },

  { 
    $sort: { avgPrice: -1 } 
  },

  {
    $project: {
      _id: 0,
      restaurant: "$restaurantName",
      averagePrice: { $round: ["$avgPrice", 2] },
      menuItemsCount: "$totalItems"
    }
  }
]).forEach((doc) => printjson(doc));