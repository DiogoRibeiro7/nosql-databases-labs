// Tempo médio de aluguér
// Correr: mongosh queries/15_average_rental_time.mongosh.js

db = db.getSiblingDB("sakila");

db.film.aggregate([
	{
		$group: {
			_id: null,
			avgRentalDuration: { $avg: "$rental_duration" },
			totalFilms: { $sum: 1 }
		}
	},
	{
		$project: {
			_id: 0,
			avgRentalDuration: 1,
			totalFilms: 1
		}
	}
]);.forEach(doc => printjson(doc));