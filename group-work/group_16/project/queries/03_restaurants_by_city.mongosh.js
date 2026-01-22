
db = db.getSiblingDB("food_express");

print("Toulouse, Nice or Paris restaurants (ordered by rating):");

// Esta querie filtra restaurantes em que o "adress city" seja ou Toulouse ou Nice ou Paris
db.restaurants.find({ "address.city": { $in: ["Toulouse", "Nice", "Paris"] } },

    // Mostra apenas os valores que quero (0 = esconder, 1 = mostrar)
    {
      _id: 0,name: 1,type: 1,rating: 1,"address.city": 1,open: 1
    }
  )

  // Ordena os resultados por rating (do maior para o menor)
  .sort({ rating: -1 })

  // Imprime cada documento no terminal
  .forEach((doc) => printjson(doc));