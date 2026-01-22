// Mostra os alugueres de todos clientes, e que staff fez cada aluguer.
// Limitado aos primeiros 20 para testes rápidos.
// Correr: mongosh queries/03_all_customer_rentals.mongosh.js

// criar indexes
db = db.getSiblingDB("sakila");

db.rental.createIndex({ customer_id: 1 }, { unique: true });
db.inventory.createIndex({ inventory_id: 1 }, { unique: true });
db.film.createIndex({ film_id: 1 }, { unique: true });
db.staff.createIndex({ staff_id: 1 }, { unique: true });

db.customer.aggregate([
	{
		$lookup: {
			from: "rental",
			localField: "customer_id",
			foreignField: "customer_id",
			as: "rentals"
		}
	},
	{ $unwind: "$rentals" },
	{
		$lookup: {
			from: "inventory",
			localField: "rentals.inventory_id",
			foreignField: "inventory_id",
			as: "inventory"
		}
	},
	{ $unwind: "$inventory" },
	{
		$lookup: {
			from: "film",
			localField: "inventory.film_id",
			foreignField: "film_id",
			as: "film"
		}
	},
	{ $unwind: "$film" },
	{
		$lookup: {
			from: "staff",
			localField: "rentals.staff_id",
			foreignField: "staff_id",
			as: "staff"
		}
	},
	{ $unwind: "$staff" },
	{
		$group: {
			_id: "$customer_id",
			customer: {
				$first: {
					name: { $concat: ["$first_name", " ", "$last_name"] },
					email: "$email"
				}
			},
			films: {
				$push: {
					title: "$film.title",
					rental_date: "$rentals.rental_date",
					staff: {
						$concat: ["$staff.first_name", " ", "$staff.last_name"]
					}
				}
			}
		}
	},
	{
		$sort: { "customer.name": 1 }
	},
	{
		$project: {
			_id: 0,
			customer: 1,
			films: 1
		}
	},
	{ $sort: { first_name: 1 } },
	{ $limit: 20 }
]).forEach(doc => printjson(doc));

//para teste
db.rental.dropIndexes();
db.inventory.dropIndexes();
db.film.dropIndexes();
db.staff.dropIndexes();
