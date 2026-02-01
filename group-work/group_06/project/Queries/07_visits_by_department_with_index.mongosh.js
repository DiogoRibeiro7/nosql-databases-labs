// Query 07: aggregate to count visits per department using the department index.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Index hint: department field already indexed so match uses a narrow scan.
const pipeline = [
	{ $match: { department: "Emergency" } }, // limit pipeline to high-priority department.
	{
		$group: {
			_id: "$department",
			total_visits: { $sum: 1 } // count visits per department for reporting.
		}
	},
	{ $sort: { total_visits: -1 } } // ensure departments with most visits appear first.
];
db.visits.aggregate(pipeline).forEach((doc) => {
	print(`Departamento: ${doc._id} | Visitas: ${doc.total_visits}`);
});

// Provar uso de índice (pedido no feedback do PR).
const explainResult = db.visits.explain("executionStats").aggregate(pipeline);
const stats = explainResult.executionStats || (explainResult.stages?.[0]?.$cursor?.executionStats) || {};
print("--- explain executionStats --- totalKeysExamined:", stats.totalKeysExamined, "| totalDocsExamined:", stats.totalDocsExamined);
