// Query to find the top 5 most popular items sold based on quantity

db.orders.aggregate([
    { $unwind: "$items" },
    { $group: {
        _id: "$items.name",
        totalSold: { $sum: "$items.qty" }
    }},
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
]);