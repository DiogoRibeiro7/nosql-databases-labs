// Query 1 só que explicada( com o .explain)
// Usage: mongosh queries/20_film_infos_with_explain.mongosh.js
db = db.getSiblingDB("sakila");

print("Film infos + execution stats:");

const pipeline = [
	{
		$lookup: { //juntar categorias do filme
			from: "film_category",
			localField: "film_id",
			foreignField: "film_id",
			pipeline: [
				{
					$lookup: { //buscar nome da categoria
						from: "category",
						localField: "category_id",
						foreignField: "category_id",
						pipeline: [
							{
								$project: { //remover campos desnecessários
									_id: 0,
									category_id: 0,
									last_update: 0
								}
							}
						],
						as: "category"
					}
				},
				{
					$project: { //remover campos desnecessários
						_id: 0,
						film_id: 0,
						category_id: 0,
						last_update: 0
					}
				}
			],
			as: "category"
		}
	},
	{
		$lookup: { //buscar linguagem
			from: "language",
			localField: "language_id",
			foreignField: "language_id",
			pipeline: [
				{
					$project: { //remover campos desnecessários
						_id: 0,
						language_id: 0,
						last_update: 0
					}
				}
			],
			as: "linguagem"
		}
	},
	{ $unwind: "$category" }, //expandir
	{ $unwind: "$category.category" },
	{ $unwind: "$linguagem" },
	{
		$lookup: { //juntar atores
			from: "film_actor",
			localField: "film_id",
			foreignField: "film_id",
			pipeline: [
				{
					$lookup: { //buscar nome do ator
						from: "actor",
						localField: "actor_id",
						foreignField: "actor_id",
						pipeline: [
							{
								$project: { //remover campos desnecessários
									_id: 0,
									actor_id: 0,
									last_update: 0
								}
							}
						],
						as: "nome"
					}
				},
				{
					$project: { //remover campos desnecessários
						_id: 0,
						film_id: 0,
						actor_id: 0,
						last_update: 0
					}
				}
			],
			as: "actor"
		}
	},
	{
		$project: { //campos finais
			_id: 0,
			title: 1,
			description: 1,
			category: "$category.category.name", //nome da categoria
			release_year: 1,
			rental_duration: 1,
			rental_rate: 1,
			replacement_cost: 1,
			rating: 1,
			special_features: 1,
			linguagem: "$linguagem.name", //nome da linguagem
			actor: 1
		}
	},
	{ $sort: { _id: 1 } }, //ordenar por id
	{ $limit: 5 } //limitar a 5
];

db.film.aggregate(pipeline).forEach((doc) => printjson(doc));

const explain = db.film.explain("executionStats").aggregate(pipeline); //obter execution stats
let stats = explain.executionStats;

if (!stats && Array.isArray(explain.stages)) {
	const cursorStage = explain.stages.find((stage) => stage.$cursor && stage.$cursor.executionStats);
	if (cursorStage) {
		stats = cursorStage.$cursor.executionStats;
	}
}

print("\nExecution stats summary:"); //titulo stats
if (stats) {
	print(`\texecutionSuccess: ${stats.executionSuccess}`); //sucesso da execução
	print(`\tExecution time (ms): ${stats.executionTimeMillis}`); //tempo execução
	print(`\tDocuments examined: ${stats.totalDocsExamined}`); //docs lidos
	print(`\tKeys examined: ${stats.totalKeysExamined}`); //chaves lidas
	print(`\tStage: ${stats.executionStages ? stats.executionStages.stage : "n/a"}`); //stage principal
} else {
	print("\tUnable to retrieve execution stats on this server version.");
}