// Shows total revenue and order count per restaurant using interconnected collections.

db = db.getSiblingDB("food_express");

print("--- Revenue and order count per restaurant ---");

db.orders.aggregate([
  
  {
    $lookup: {
      from: "restaurants",
      localField: "restaurantId",
      foreignField: "_id",
      as: "restaurantDetails"
    }
  },
  
  { $unwind: "$restaurantDetails" },
  
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
  
  {
    $sort: { "revenue": -1 }
  }
]).forEach((doc) => printjson(doc));