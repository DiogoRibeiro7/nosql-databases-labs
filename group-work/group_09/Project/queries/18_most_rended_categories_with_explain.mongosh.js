// Igual à query 9, mas com .explain
// Usage: mongosh queries/18_most_rended_categories_with_explain.mongosh.js

db = db.getSiblingDB("sakila");

print("Most rented film categories + execution stats:");
const pipeline = [
	{
		$lookup: {
			from: "inventory",
			localField: "inventory_id",
			foreignField: "inventory_id",
			as: "inventory"
		}
	},
	{ $unwind: "$inventory" },
	{
		$lookup: {
			from: "film_category",
			localField: "inventory.film_id",
			foreignField: "film_id",
			as: "filmCategories"
		}
	},
	{ $unwind: "$filmCategories" },
	{
		$lookup: {
			from: "category",
			localField: "filmCategories.category_id",
			foreignField: "category_id",
			as: "category"
		}
	},
	{ $unwind: "$category" },
	{
		$group: {
			_id: "$category.name",
			rentalCount: { $sum: 1 }
		}
	},
	{ $sort: { rentalCount: -1 } },
	{ $limit: 10 }
];

db.rental.aggregate(pipeline).forEach((doc) => printjson(doc));

const explain = db.rental.explain("executionStats").aggregate(pipeline);
let stats = explain.executionStats;

if (!stats && Array.isArray(explain.stages)) {
	const cursorStage = explain.stages.find((stage) => stage.$cursor && stage.$cursor.executionStats);
	if (cursorStage) {
		stats = cursorStage.$cursor.executionStats;
	}
}

print("\nExecution stats summary:");
if (stats) {
	print(`\tExecution time (ms): ${stats.executionTimeMillis}`);
	print(`\tDocuments examined: ${stats.totalDocsExamined}`);
	print(`\tKeys examined: ${stats.totalKeysExamined}`);
	print(`\tStage: ${stats.executionStages ? stats.executionStages.stage : "n/a"}`);
} else {
	print("\tUnable to retrieve execution stats on this server version.");
}