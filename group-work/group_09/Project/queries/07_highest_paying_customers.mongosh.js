// Mostra os 20 clientes que mais gastaram, e quanto gastaram. Ordenado por gasto total
// Correr: mongosh queries/07_highest_paying_customers.mongosh.js

db = db.getSiblingDB("sakila");

print("Top 20 clientes por gasto total:");
db.payment.aggregate([
	{
		$group: { //agrupar por cliente
			_id: "$customer_id",
			totalPaid: { $sum: { $toDouble: "$amount" } }, //"toDouble" é para converter a string para float (senão o "sum" não funciona)
			payments: { $sum: 1 }, //contar pagamentos
			lastPayment: { $max: "$payment_date" } //ultimo pagamento
		}
	},
	{ $sort: { totalPaid: -1 } }, //ordenar por total pago
	{ $limit: 20 }, //limitar a 20 clientes
	{
		$lookup: { //juntar dados do cliente
			from: "customer",
			localField: "_id",
			foreignField: "customer_id",
			as: "customer"
		}
	},
	{ $unwind: { path: "$customer" } }, //expandir cliente
	{
		$project: { //campos finais
			customer_id: "$_id",
			name: { $concat: ["$customer.first_name", " ", "$customer.last_name"] }, //nome completo
			email: "$customer.email",
			totalPaid: 1,
			payments: 1,
			lastPayment: 1,
			_id: 0
		}
	}
]).forEach(doc => printjson(doc));