// Query to calculate the average price of dishes for each cuisine type

db.restaurants.aggregate([
    { $unwind: "$menu" },
    { $group: {
        _id: "$type",
        avgDishPrice: { $avg: "$menu.price" }
    }}
]);