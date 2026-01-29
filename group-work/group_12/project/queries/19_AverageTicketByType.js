// Query to calculate average ticket value by restaurant type

db.orders.aggregate([
    { $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restInfo"
    }},
    { $unwind: "$restInfo" },
    { $group: {
        _id: "$restInfo.type",
        avgTicket: { $avg: "$totalPrice" }
    }},
    { $sort: { avgTicket: -1 } }
]);