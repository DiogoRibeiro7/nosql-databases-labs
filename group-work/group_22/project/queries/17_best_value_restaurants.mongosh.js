// Lists restaurants with above-median rating and below-median average price.
// Usage: mongosh queries/17_best_value_restaurants.mongosh.js

db = db.getSiblingDB("group_22");
print("Best value restaurants (above-median rating, below-median avg price):");
// First, calculate medians
let ratings = db.restaurants.find({}, { rating: 1 }).sort({ rating: 1 }).toArray();
let prices = db.menu_items.aggregate([
  { $group: { _id: "$restaurantId", avgPrice: { $avg: "$price" } } },
  { $sort: { avgPrice: 1 } }
]).toArray();

let medianRating = ratings[Math.floor(ratings.length / 2)].rating;
let medianPrice = prices[Math.floor(prices.length / 2)].avgPrice;

db.restaurants
  .aggregate([
    {
      $lookup: {
        from: "menu_items",
        localField: "_id",
        foreignField: "restaurantId",
        as: "menu"
      }
    },
    {
      $addFields: {
        avgPrice: { $avg: "$menu.price" }
      }
    },
    {
      $match: {
        rating: { $gt: medianRating },
        avgPrice: { $lt: medianPrice }
      }
    },
    {
      $project: {
        _id: 0,
        name: 1,
        rating: 1,
        avgPrice: 1
      }
    }
  ])
  .forEach((doc) => printjson(doc));