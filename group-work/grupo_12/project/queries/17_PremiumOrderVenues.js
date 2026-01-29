// Query to find all venues (restaurants) where orders with a total price greater than $100 have been placed.

db.orders.aggregate([
    { $match: { totalPrice: { $gt: 100 } } },
    { $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant"
    }},
    { $project: { "restaurant.name": 1, totalPrice: 1 } }
]);