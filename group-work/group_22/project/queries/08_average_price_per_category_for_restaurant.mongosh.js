// Computes the average price of dishes for each category for a specific restaurant.
// Usage: mongosh queries/08_average_price_per_category_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Average price per category for restaurant");
db.menu_items
  .aggregate([
    { $match: { restaurantId: ObjectId("51fe29d3685d4a0a9f055a87") } },
    {
      $group: {
        _id: { restaurantId: "$restaurantId", category: "$category" },
        averagePrice: { $avg: "$price" }
      }
    },
    {
      $lookup: {
        from: "restaurants",
        localField: "_id.restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    { $unwind: "$restaurant" },
    {
      $project: {
        _id: 0,
        restaurantName: "$restaurant.name",
        category: "$_id.category",
        averagePrice: 1
      }
    },
    { $sort: { averagePrice: -1 } }
  ])
  .forEach((doc) => printjson(doc));