// Mostra quantos alugeres cada "staff" fez, ordenado em ordem decrescente.
// Correr: mongosh queries/08_staff_performance.mongosh.js

db = db.getSiblingDB("sakila");

print("Alugueres processados por staff:");
db.rental.aggregate([
	{ $group: { _id: "$staff_id", rentals: { $sum: 1 } } },
	{ $sort: { rentals: -1 } },
	{
		$lookup: {
			from: "staff",
			localField: "_id",
			foreignField: "staff_id",
			as: "staff"
		}
	},
	{ $unwind: { path: "$staff" } },
	{ $project: { staff_id: "$_id", name: { $concat: ["$staff.first_name", " ", "$staff.last_name"] }, rentals: 1, _id: 0 } }
]).forEach(doc => printjson(doc));