
// Identificar restaurantes com encomendas repetidas, agrupados por cidade.



db = db.getSiblingDB("food_express");

print("Cities with restaurants that receive repeat order:");


db.orders.aggregate([
    // Agrupa as encomendas por restaurante
    // Conta quantas encomendas existem por restaurante
    {
      $group: {
        _id: "$restaurantId",
        totalOrders: { $sum: 1 },
      },
    },

    // Filtra apenas restaurantes com pelo menos 2 encomendas
    {
      $match: {
        totalOrders: { $gte: 2 },
      },
    },

    {
      $lookup: {
        from: "restaurants",
        localField: "_id",
        foreignField: "_id",
        as: "restaurant",
      },
    },

   
    { $unwind: "$restaurant" },

    
    {
      $group: {
        _id: "$restaurant.address.city",
        restaurantesComRecorrencia: { $sum: 1 },
        restaurantIds: { $addToSet: "$restaurant._id" },
      },
    },

    {
      $sort: {
        restaurantesComRecorrencia: -1,
      },
    },
  ])

  .forEach((doc) => printjson(doc));
