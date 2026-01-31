// Lists individual line items for a specific order that belongs to a restaurant.
// Usage: mongosh queries/09_order_items_for_order_from_restaurant.mongosh.js

db = db.getSiblingDB("group_22");
print("Order items for order 'ORD-1000' ");
db.order_items
  .aggregate([
    { $match: { orderId: ObjectId("690367d6b52abfb7d152f781") } },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order"
      }
    },
    { $unwind: "$order" },
    {
      $lookup: {
        from: "restaurants",
        localField: "order.restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    },
    { $unwind: "$restaurant" },
    {
      $project: {
        _id: 0,
        restaurantName: "$restaurant.name",
        name: 1,
        qty: 1,
        unitPrice: 1
      }
    }
  ])
  .forEach((doc) => printjson(doc));