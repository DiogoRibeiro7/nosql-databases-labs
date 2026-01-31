// Lists menu items of a specific restaurant filtered by category (desserts).
// Usage: mongosh queries/07_menu_items_by_category_for_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Dessert menu items for restaurant ");
db.menu_items
  .aggregate([
    { $match: { restaurantId: ObjectId("51fe29d3685d4a0a9f055a87"), category: "dessert" } },
    {
      $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    { $unwind: "$restaurant" },
    {
      $project: {
        _id: 0,
        restaurantName: "$restaurant.name",
        item: 1,
        price: 1
      }
    }
  ])
  .forEach((doc) => printjson(doc));