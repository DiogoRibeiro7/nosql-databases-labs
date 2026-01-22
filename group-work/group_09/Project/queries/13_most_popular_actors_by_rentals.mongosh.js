// Mostra quantos arrendamentos cada ator faz parte, ordenados por ordem de arrendamentos decrescente
// Correr: mongosh queries/13_most_popular_actors_by_rentals.mongosh.js

db = db.getSiblingDB("sakila");

db.rental.aggregate([
	{ $lookup: { from: "inventory", localField: "inventory_id", foreignField: "inventory_id", as: "inv" }},
	{ $unwind: "$inv" },
	{ $lookup: { from: "film_actor", localField: "inv.film_id", foreignField: "film_id", as: "fa" }},
	{ $unwind: "$fa" },
	{ $group: { _id: "$fa.actor_id", rentals: { $sum: 1 }}},
	{ $lookup: { from: "actor", localField: "_id", foreignField: "actor_id", as: "actor" }},
	{ $unwind: "$actor" },
	{ $project: {
		_id: 0,
		actor: { $concat: ["$actor.first_name", " ", "$actor.last_name"] },
		rentals: 1
	}},
	{ $sort: { rentals: -1 }},
	{ $limit: 10 }
]);