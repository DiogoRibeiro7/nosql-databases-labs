// Query to get daily sales trend: total revenue and number of orders per day

db.orders.aggregate([
    { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        dailyRevenue: { $sum: "$totalPrice" },
        ordersCount: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
]);