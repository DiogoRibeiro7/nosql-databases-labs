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
    { 
      _id: 0, 
      name: 1, 
      type: 1, 
      "address.city": 1,
      menu: 1 
    }
  )

  .sort({ name: 1 })
  

  .forEach((doc) => printjson(doc));