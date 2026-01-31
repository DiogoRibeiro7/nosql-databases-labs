// Consulta para obter detalhes dos pedidos com join na coleção de restaurantes

db.orders.aggregate([
    { $match: { status: "processing" } }, // Filtra primeiro (usa índice)
    { $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurantDetails"
    }},
    { $unwind: "$restaurantDetails" }, // Transforma array em objeto
    { $project: {
        orderNumber: 1,
        totalPrice: 1,
        "restaurantDetails.name": 1,
        "restaurantDetails.address.city": 1
    }}
]);