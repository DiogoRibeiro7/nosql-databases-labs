// vegetarian or lebanese open restaurants with rating >= 3.5 sorted by rating descending

db = db.getSiblingDB("food_express");

print("Open Vegetarian or Lebanese restaurants (sorted by rating):");


db.restaurants.find(
    { 
      "open": true,
      "type": { $in: ["Végétarien", "Libanais"] },
      "rating": { $gte: 3.5 }
    }, 
    { 
      _id: 0, 
      name: 1, 
      type: 1, 
      rating: 1, 
      "address.city": 1,
      open: 1
    }
  )
  // Ordena por rating decrescente para mostrar os melhores primeiro
  .sort({ rating: -1 })
  
  // Imprime cada documento no terminal
  .forEach((doc) => printjson(doc));