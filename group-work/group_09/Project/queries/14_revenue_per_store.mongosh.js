// Mostra quanto cada loja lucrou
// Correr: mongosh queries/14_revenue_per_store.mongosh.js

db = db.getSiblingDB("sakila");

db.payment.aggregate([
	{ $lookup: { from: "rental", localField: "rental_id", foreignField: "rental_id", as: "rental" }}, //juntar dados do aluguer
	{ $unwind: "$rental" }, //expandir aluguer
	{ $lookup: { from: "inventory", localField: "rental.inventory_id", foreignField: "inventory_id", as: "inv" }}, //juntar inventário
	{ $unwind: "$inv" }, //expandir inventário
	{ $group: { _id: "$inv.store_id", revenue: { $sum: { $toDouble: "$amount" }}}}, //somar receita por loja
	{ $sort: { revenue: -1 }} //ordenar por receita decrescente
]).forEach(doc => printjson(doc));