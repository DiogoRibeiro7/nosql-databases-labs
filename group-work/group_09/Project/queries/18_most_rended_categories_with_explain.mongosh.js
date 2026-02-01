// Igual à query 9, mas com .explain
// Usage: mongosh queries/18_most_rended_categories_with_explain.mongosh.js

db = db.getSiblingDB("sakila");

print("Most rented film categories + execution stats:");
const pipeline = [
	{
		$lookup: { //juntar inventario
			from: "inventory",
			localField: "inventory_id",
			foreignField: "inventory_id",
			as: "inventory"
		}
	},
	{ $unwind: "$inventory" }, //expandir inventario
	{
		$lookup: { //juntar categorias do filme
			from: "film_category",
			localField: "inventory.film_id",
			foreignField: "film_id",
			as: "filmCategories"
		}
	},
	{ $unwind: "$filmCategories" }, //expandir categoria do filme
	{
		$lookup: { //juntar dados da categoria
			from: "category",
			localField: "filmCategories.category_id",
			foreignField: "category_id",
			as: "category"
		}
	},
	{ $unwind: "$category" }, //expandir categoria
	{
		$group: { //contar alugueres por categoria
			_id: "$category.name",
			rentalCount: { $sum: 1 }
		}
	},
	{ $sort: { rentalCount: -1 } }, //ordenar desc por alugueres
	{ $limit: 10 } //limitar a top 10
];

db.rental.aggregate(pipeline).forEach((doc) => printjson(doc)); //mostrar resultado

const explain = db.rental.explain("executionStats").aggregate(pipeline); //obter execution stats
let stats = explain.executionStats;

if (!stats && Array.isArray(explain.stages)) {
	const cursorStage = explain.stages.find((stage) => stage.$cursor && stage.$cursor.executionStats);
	if (cursorStage) {
		stats = cursorStage.$cursor.executionStats;
	}
}

print("\nExecution stats summary:");
if (stats) {
	print(`\tExecution time (ms): ${stats.executionTimeMillis}`); //tempo de execução
	print(`\tDocuments examined: ${stats.totalDocsExamined}`); //documentos lidos
	print(`\tKeys examined: ${stats.totalKeysExamined}`); //chaves lidas
	print(`\tStage: ${stats.executionStages ? stats.executionStages.stage : "n/a"}`); //stage principal
} else {
	print("\tUnable to retrieve execution stats on this server version."); //fallback
}