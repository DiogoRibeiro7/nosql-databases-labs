// Query 07: aggregate to count visits per department using the department index.
db = db.getSiblingDB("medical_database");

// Index hint: department field already indexed so match uses a narrow scan.
db.visits.aggregate([
	{ $match: { department: "Emergency" } }, // limit pipeline to high-priority department.
	{
		$group: {
			_id: "$department",
			total_visits: { $sum: 1 } // count visits per department for reporting.
		}
	},
	{ $sort: { total_visits: -1 } } // ensure departments with most visits appear first.
]).forEach((doc) => {
	print(`Departamento: ${doc._id} | Visitas: ${doc.total_visits}`);
});
