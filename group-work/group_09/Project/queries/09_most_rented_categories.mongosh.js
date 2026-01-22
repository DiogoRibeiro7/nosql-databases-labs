// Mostra que categorias foram mais arrendadas
// Correr: mongosh queries/09_most_rented_categories.mongosh.js
db = db.getSiblingDB("sakila");

db.rental.aggregate([
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
]).forEach(doc => printjson(doc));