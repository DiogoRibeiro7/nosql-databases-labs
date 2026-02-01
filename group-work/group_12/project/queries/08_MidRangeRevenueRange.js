// Query to find all orders with a total price between $50 and $80 inclusive

db.orders.find({ totalPrice: { $gte: 50, $lte: 80 } });