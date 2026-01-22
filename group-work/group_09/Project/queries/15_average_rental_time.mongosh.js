// Tempo médio de aluguér
// Correr: mongosh queries/15_average_rental_time.mongosh.js

db = db.getSiblingDB("sakila");

db.rental.aggregate([
	{
		$lookup: {
			from: "inventory",
			localField: "inventory_id",
			foreignField: "inventory_id",
			as: "inv"
		}
	},
	{ $unwind: "$inv" },
	{
		$project: {
			storeId: "$inv.store_id",
			durationHours: {
				$divide: [
					{ $subtract: [ { $toDate: "$return_date" }, { $toDate: "$rental_date" } ] },
					1000 * 60 * 60
				]
			}
		}
	},
	{
		$group: {
			_id: "$storeId",
			avgRentalHours: { $avg: "$durationHours" },
			rentalCount: { $sum: 1 }
		}
	},
	{ $sort: { avgRentalHours: -1 } }
]).forEach(doc => printjson(doc));