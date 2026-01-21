// Aggregation example:
// Identificar restaurantes com encomendas repetidas, agrupados por cidade.
// Uso: mongosh queries/13_returning_orders_by_city.mongosh.js

// Seleciona a base de dados do projeto
db = db.getSiblingDB("Food_express");

print("Cities with restaurants that receive repeat order:");

// Executa a pipeline de agregação sobre a coleção orders
db.orders
  .aggregate([
    // Agrupa as encomendas por restaurante
    // Conta quantas encomendas existem por restaurante
    {
      $group: {
        _id: "$restaurantId",
        totalOrders: { $sum: 1 },
      },
    },

    // Filtra apenas restaurantes com pelo menos 2 encomendas
    // (considerados restaurantes com clientes recorrentes)
    {
      $match: {
        totalOrders: { $gte: 2 },
      },
    },

    // Junta a coleção restaurants para obter a cidade do restaurante
    {
      $lookup: {
        from: "restaurants",
        localField: "_id",
        foreignField: "_id",
        as: "restaurant",
      },
    },

    // Converte o array restaurant num documento simples
    { $unwind: "$restaurant" },

    // Agrupa por cidade do restaurante
    // Conta quantos restaurantes têm encomendas repetidas
    {
      $group: {
        _id: "$restaurant.address.city",
        restaurantesComRecorrencia: { $sum: 1 },
        restaurantIds: { $addToSet: "$restaurant._id" },
      },
    },

    // Ordena as cidades por número de restaurantes com recorrência (decrescente)
    {
      $sort: {
        restaurantesComRecorrencia: -1,
      },
    },
  ])

  // Imprime cada resultado de forma legível
  .forEach((doc) => printjson(doc));
