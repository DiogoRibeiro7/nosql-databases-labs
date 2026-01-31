// Procura restaurantes que oferecem sobremesas económicas (abaixo de 10€)

db = db.getSiblingDB("food_express");

print("Restaurantes com sobremesas < 10€ (Filtrado):");

db.restaurants.aggregate([
  { $match: { "menu": { $elemMatch: { category: "dessert", price: { $lt: 10 } } } } },

  {
    $project: {
      _id: 0,
      name: 1,
      city: "$address.city",
      menu: {
        $filter: {
          input: "$menu",
          as: "item",
          cond: { $and: [{ $eq: ["$$item.category", "dessert"] },{ $lt: ["$$item.price", 10] }]}
        }
      }
    }}

]).forEach(printjson);