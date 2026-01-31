// Mostra quantos arrendamentos cada ator faz parte, ordenados por ordem de arrendamentos decrescente
// Correr: mongosh queries/13_most_popular_actors_by_rentals.mongosh.js

db = db.getSiblingDB("sakila");

db.rental.aggregate([
	{ $lookup: { from: "inventory", localField: "inventory_id", foreignField: "inventory_id", as: "inv" }}, //juntar inventário
	{ $unwind: "$inv" }, //expandir inventário
	{ $lookup: { from: "film_actor", localField: "inv.film_id", foreignField: "film_id", as: "fa" }}, //juntar atores do filme
	{ $unwind: "$fa" }, //expandir ator
	{ $group: { _id: "$fa.actor_id", rentals: { $sum: 1 }}}, //contar alugueres por ator
	{ $lookup: { from: "actor", localField: "_id", foreignField: "actor_id", as: "actor" }}, //juntar dados do ator
	{ $unwind: "$actor" }, //expandir ator
	{ $project: { //campos finais
		_id: 0,
		actor: { $concat: ["$actor.first_name", " ", "$actor.last_name"] }, //nome completo
		rentals: 1 //número de alugueres
	}},
	{ $sort: { rentals: -1 }}, //ordenar por alugueres
	{ $limit: 10 } //limitar a 10
]).forEach(doc => printjson(doc));