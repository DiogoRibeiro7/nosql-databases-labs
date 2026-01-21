db = db.getSiblingDB("food_express");

print("Top rated Asian or Italian restaurants in Toulouse or Paris:");

db.restaurants.find(
    { 
      
      "address.city": { $in: ["Toulouse", "Paris"] },
      type: { $in: ["Asiatique", "Italien"] },
      rating: { $gte: 4.0 } 
    }, 
    { 

      _id: 0, 
      name: 1, 
      type: 1, 
      rating: 1, 
      "address.city": 1 
    }
  )
 
  .sort({ rating: -1 })
  

  .forEach((doc) => printjson(doc));