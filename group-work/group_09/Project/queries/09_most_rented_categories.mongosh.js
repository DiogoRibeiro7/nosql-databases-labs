// Mostra que categorias foram mais arrendadas
// Correr: mongosh queries/09_most_rented_categories.mongosh.js
db = db.getSiblingDB("sakila");

db.rental.aggregate([
	{
		$lookup: { //juntar inventário
			from: "inventory",
			localField: "inventory_id",
			foreignField: "inventory_id",
			as: "inventory"
		}
	},
	{ $unwind: "$inventory" }, //expandir inventário
	{
		$lookup: { //juntar categorias do filme
			from: "film_category",
			localField: "inventory.film_id",
			foreignField: "film_id",
			as: "filmCategories"
		}
	},
	{ $unwind: "$filmCategories" }, //expandir categorias
	{
		$lookup: { //juntar nome da categoria
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
	{ $sort: { rentalCount: -1 } }, //ordenar por nº de alugueres
	{ $limit: 10 } //limitar aos top 10
]).forEach(doc => printjson(doc));