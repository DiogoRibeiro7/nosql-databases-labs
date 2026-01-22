// Aggregation example:
// Calcula o preço médio dos itens no menu de cada restaurante.

db = db.getSiblingDB("food_express");

print("--- Average Menu Pricing by Restaurant ---");

db.restaurants.aggregate([
  // 1. "Explode" o array de menu para tratar cada prato como um documento
  { $unwind: "$menu" },

  // 2. Agrupa pelo nome do restaurante e calcula a média de preços
  {
    $group: {
      _id: "$name",
      avgPrice: { $avg: "$menu.price" },
      totalItems: { $sum: 1 }
    }
  },

  // 3. Ordena do mais caro para o mais barato
  { 
    $sort: { avgPrice: -1 } 
  },

  // 4. Formata o resultado final com arredondamento
  {
    $project: {
      _id: 0,
      restaurant: "$_id",
      averagePrice: { $round: ["$avgPrice", 2] },
      menuItemsCount: "$totalItems"
    }
  }
]).forEach((doc) => printjson(doc));