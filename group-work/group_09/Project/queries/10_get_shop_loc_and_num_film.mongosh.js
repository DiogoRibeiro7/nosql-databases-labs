//quantos filmes tem em cada loja e a sua localização
// Usage: mongosh queries/10_feedback_distribution_by_vendor.mongosh.js
db = db.getSiblingDB("sakila");

db.store.aggregate([
	{
		$lookup: { //juntar moradas da loja
			from: "address",
			localField: "address_id",
			foreignField: "address_id",
			pipeline: [
				{
					$lookup: { //juntar cidade
						from: "city",
						localField: "city_id",
						foreignField: "city_id",
						pipeline: [
							{
								$lookup: { //juntar país
									from: "country",
									localField: "country_id",
									foreignField: "country_id",
									pipeline: [{ $project: { _id: 0, country: 1 } }], //apenas nome do país
									as: "country"
								}
							},
							{
								$project: { //campos finais da cidade
									_id: 0,
									city: 1,
									country: 1
								}
							}
						],
						as: "city"
					}
				},
				{
					$project: { //excluir campos desnecessários
						_id: 0,
						address_id: 0,
						address2: 0,
						phone: 0,
						city_id: 0,
						postal_code: 0,
						location: 0,
						last_update: 0
					}
				},
			],
			as: "adress"
		}
	},
	{ $unwind: "$adress" }, //expandir listas
	{ $unwind: "$adress.city" },
	{ $unwind: "$adress.city.country" },

	{
		$lookup: { //juntar inventário da loja
			from: "inventory",
			localField: "store_id",
			foreignField: "store_id",
			as: "films"
		}
	},
	{
		$project: { //campos finais
			_id: 0,
			store_id: 1,
			adress: "$adress.address", //morada principal
			city: "$adress.city.city", //nome da cidade
			country: "$adress.city.country.country", //nome do país
			numOfFilms: { $size: "$films" } //número de filmes na loja
		}
	}
]).forEach((doc) => printjson(doc));