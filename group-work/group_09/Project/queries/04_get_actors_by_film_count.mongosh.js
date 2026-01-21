// Mostra os 20 atores com o maior número de filmes.
// Correr: mongosh queries/04_get_actors_by_film_count.mongosh.js

db = db.getSiblingDB("sakila");

print("Atores com mais filmes:");
db.film_actor.aggregate([
	{
		$group: {
			_id: "$actor_id",
			filmCount: { $sum: 1 }
		}
	},
	{ $sort: { filmCount: -1 } },
	{ $limit: 20 },
	{
		$lookup: {
			from: "actor",
			localField: "_id",
			foreignField: "actor_id",
			as: "actor"
		}
	},
	{ $unwind: "$actor" },
	{ $project: { actorId: "$_id", name: { $concat: ["$actor.first_name", " ", "$actor.last_name"] }, filmCount: 1, _id: 0 } }
]).forEach(doc => printjson(doc));