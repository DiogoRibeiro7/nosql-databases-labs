// Computes the average menu item price per restaurant and orders restaurants from lowest to highest average price.
// Usage: mongosh queries/14_restaurants_ordered_by_average_price.mongosh.js

db = db.getSiblingDB("group_22");
print("Restaurants ordered by average menu item price (lowest first):");
db.menu_items
  .aggregate([
    {
      $group: {
        _id: "$restaurantId",
        avgPrice: { $avg: "$price" }
      }
    },
    {
      $lookup: {
        from: "restaurants",
        localField: "_id",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    { $unwind: "$restaurant" },
    {
      $project: {
        _id: 0,
        name: "$restaurant.name",
        avgPrice: 1
      }
    },
    { $sort: { avgPrice: 1 } }
  ])
  .forEach((doc) => printjson(doc));