// Tempo médio de aluguér
// Correr: mongosh queries/15_average_rental_time.mongosh.js

db = db.getSiblingDB("sakila");

db.film.aggregate([
	{
		$group: { //agrupar métricas de filmes
			_id: null,
			avgRentalDuration: { $avg: "$rental_duration" }, //média duração aluguer
			totalFilms: { $sum: 1 } //contar total de filmes
		}
	},
	{
		$project: { //campos finais
			_id: 0,
			avgRentalDuration: 1,
			totalFilms: 1
		}
	}
]).forEach(doc => printjson(doc));