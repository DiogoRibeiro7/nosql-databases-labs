// Qual é a faturação total e o volume de vendas de cada restaurante, por ordem de importância?


db = db.getSiblingDB("food_express");

print("--- Revenue and order count per restaurant ---");

db.orders.aggregate([
  // Associa cada encomenda ao restaurante correspondente
  {
    $lookup: {
      from: "restaurants",
      localField: "restaurantId",
      foreignField: "_id",
      as: "restaurantDetails"
    }
  },

   // Necessário para aceder diretamente aos campos do restaurante
  { $unwind: "$restaurantDetails" },

  // Calcula o valor total e o numero de encomendas
  {
    $group: {
      _id: { 
        restaurantId: "$restaurantId", 
        name: "$restaurantDetails.name" 
      },
      revenue: { $sum: "$totalPrice" }, 
      orders: { $sum: 1 }               
    }
  },
  
  //Ordena os resultados por valor do maior para o menor
  {
    $sort: { "revenue": -1 }
  }
  //Imprime o resultado final
]).forEach((doc) => printjson(doc));