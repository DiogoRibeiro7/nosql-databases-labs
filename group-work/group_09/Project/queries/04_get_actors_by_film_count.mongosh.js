// Mostra os 20 atores com o maior número de filmes.
// Correr: mongosh queries/04_get_actors_by_film_count.mongosh.js

print("Atores com mais filmes:");

db.film_actor.aggregate([
	{
		$group: { //contar filmes por ator
			_id: "$actor_id",
			filmCount: { $sum: 1 }
		}
	},
	{ $sort: { filmCount: -1 } }, //ordenar por numero de filmes
	{ $limit: 20 }, //limitar a 20 atores
	{
		$lookup: { //juntar dados do ator
			from: "actor",
			localField: "_id",
			foreignField: "actor_id",
			as: "actor"
		}
	},
	{ $unwind: "$actor" }, //expandir ator
	{
		$project: { //campos finais
			actorId: "$_id",
			name: { $concat: ["$actor.first_name", " ", "$actor.last_name"] }, //nome completo
			filmCount: 1,
			_id: 0
		}
	}
]).forEach(doc => printjson(doc));