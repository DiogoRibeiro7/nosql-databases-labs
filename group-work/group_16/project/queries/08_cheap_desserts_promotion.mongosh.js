// Procura restaurantes que oferecem sobremesas económicas (abaixo de 10€)

db = db.getSiblingDB("food_express");

print("Restaurants with budget-friendly desserts (< 10€):");

db.restaurants.find(
    { 
      "menu": { 
        $elemMatch: { 
          category: "dessert", 
          price: { $lt: 10 } 
        } 
      } 
    }, 
    // Mostra apenas os valores que quero (0 = esconder, 1 = mostrar)
    { 
      _id: 0, 
      name: 1, 
      type: 1, 
      "address.city": 1,
      menu: 1 
    }
  )
// Ordena os restaurantes que oferecem sobremesas económicas (do o menor para o maior)
  .sort({ name: 1 })
  
// Imprime cada documento no terminal
  .forEach((doc) => printjson(doc));