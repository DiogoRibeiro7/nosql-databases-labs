//listar os filmes de terror
// Correr: mongosh queries/12_get_Horror_movies.mongosh.js
db = db.getSiblingDB("sakila");
db.film_category.aggregate([
	// Join category to get category name
	{
		$lookup: {
			from: "category",
			localField: "category_id",
			foreignField: "category_id",
			as: "category"
		}
	},
	{ $unwind: "$category" },

	{ $match: { "category.name": "Horror" } }, //filtrar por nome

	// Join film
	{
		$lookup: { //juntar dados do filme
			from: "film",
			localField: "film_id",
			foreignField: "film_id",
			as: "film"
		}
	},
	{ $unwind: "$film" }, //expandir filme
	{
		$project: {
			_id: 0,
			title: "$film.title"
		}
	}
]).forEach(doc => printjson(doc));