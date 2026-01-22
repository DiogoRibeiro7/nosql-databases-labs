db = db.getSiblingDB("food_express");

print("Top rated Asian or Italian restaurants in Toulouse or Paris:");

db.restaurants.find(
    { 
      // Filtra restaurantes localizados nas cidades indicadas
      "address.city": { $in: ["Toulouse", "Paris"] },
      // Filtra por tipo de cozinha
      type: { $in: ["Asiatique", "Italien"] },
      // Filtra restaurantes com rating igual ou superior a 4.0
      rating: { $gte: 4.0 } 
    }, 
    { 
      // Mostra apenas os valores que quero (0 = esconder, 1 = mostrar)
      _id: 0, 
      name: 1, 
      type: 1, 
      rating: 1, 
      "address.city": 1 
    }
  )
 // Ordena os resultados por rating (do maior para o menor)
  .sort({ rating: -1 })
  
// Imprime cada documento no terminal
  .forEach((doc) => printjson(doc));