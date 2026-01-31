// Query to find the 5 most recent orders with status "delivered"

db.orders.find({ status: "delivered" })
    .sort({ createdAt: -1 })
    .limit(5);