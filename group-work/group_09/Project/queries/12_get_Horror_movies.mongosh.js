//listar os filmes de terror
// Correr: mongosh queries/12_get_Horror_moviess.mongosh.js
db = db.getSiblingDB("sakila");
db.film_category.aggregate([
	{ $match: { category_id: 11 } }, //filtrar pela categoria 11
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
		$project: { //remover campos desnecessários
			_id: 0,
			film_id: 0,
			category_id: 0,
			last_update: 0
		}
	},
	{ $replaceRoot: { newRoot: { film: "$film.title" } } } //substituir documento pelo título do filme
]).forEach(doc => printjson(doc));