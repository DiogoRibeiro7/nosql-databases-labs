// Query to find all orders with a total price greater than $100

db.orders.find({ totalPrice: { $gt: 100 } });