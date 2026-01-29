// Query to count the number of orders with status "processing"

db.orders.countDocuments({ status: "processing" });