// Mostra quanto cada loja lucrou
// Correr: mongosh queries/14_revenue_per_store.mongosh.js

db = db.getSiblingDB("sakila");

db.payment.aggregate([
	{ $lookup: { from: "rental", localField: "rental_id", foreignField: "rental_id", as: "rental" }},
	{ $unwind: "$rental" },
	{ $lookup: { from: "inventory", localField: "rental.inventory_id", foreignField: "inventory_id", as: "inv" }},
	{ $unwind: "$inv" },
	{ $group: { _id: "$inv.store_id", revenue: { $sum: { $toDouble: "$amount" }}}},
	{ $sort: { revenue: -1 }}
]).forEach(doc => printjson(doc));