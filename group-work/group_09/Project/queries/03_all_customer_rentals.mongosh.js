// Mostra os alugueres de todos clientes, e que staff fez cada aluguer.
// Limitado aos primeiros 20 para testes rápidos.
// Correr: mongosh queries/03_all_customer_rentals.mongosh.js

db = db.getSiblingDB("sakila");

db.customer.aggregate([
	{
		$lookup: { //juntar alugueres do cliente
			from: "rental",
			localField: "customer_id",
			foreignField: "customer_id",
			as: "rentals"
		}
	},
	{ $unwind: "$rentals" }, //expandir alugueres
	{
		$lookup: { //juntar inventário
			from: "inventory",
			localField: "rentals.inventory_id",
			foreignField: "inventory_id",
			as: "inventory"
		}
	},
	{ $unwind: "$inventory" }, //expandir inventário
	{
		$lookup: { //juntar filme
			from: "film",
			localField: "inventory.film_id",
			foreignField: "film_id",
			as: "film"
		}
	},
	{ $unwind: "$film" }, //expandir filme

	{
		$lookup: { //juntar staff
			from: "staff",
			localField: "rentals.staff_id",
			foreignField: "staff_id",
			as: "staff"
		}
	},
	{ $unwind: "$staff" }, //expandir staff
	{
		$group: { //agrupar por cliente
			_id: "$customer_id",
			customer: {
				$first: { //dados do cliente
					name: { $concat: ["$first_name", " ", "$last_name"] },
					email: "$email"
				}
			},
			films: {
				$push: { //lista de filmes alugados
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
		$sort: { "customer.name": 1 } //ordenar por nome do cliente
	},
	{
		$project: { //campos finais
			_id: 0,
			customer: 1,
			films: 1
		}
	},
	{ $limit: 20 } //limitar a 20
]).forEach(doc => printjson(doc));