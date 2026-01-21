// Mostra os 20 clientes que mais gastaram, e quanto gastaram. Ordenado por gasto total
// Correr: mongosh queries/07_highest_paying_customers.mongosh.js

db = db.getSiblingDB("sakila");

print("Top 20 clientes por gasto total:");
db.payment.aggregate([
	{
		$group: {
			_id: "$customer_id",
			totalPaid: { $sum: { $toDouble: "$amount" } }, //"toDouble" é para converter a string para float (senão o "sum" não funciona)
			payments: { $sum: 1 },
			lastPayment: { $max: "$payment_date" }
		}
	},
	{ $sort: { totalPaid: -1 } },
	{ $limit: 20 },
	{
		$lookup: {
			from: "customer",
			localField: "_id",
			foreignField: "customer_id",
			as: "customer"
		}
	},
	{ $unwind: { path: "$customer" } },
	{
		$project: {
			customer_id: "$_id",
			name: { $concat: ["$customer.first_name", " ", "$customer.last_name"] },
			email: "$customer.email",
			totalPaid: 1,
			payments: 1,
			lastPayment: 1,
			_id: 0
		}
	}
]).forEach(doc => printjson(doc));