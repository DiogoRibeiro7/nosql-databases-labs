//listar os filmes tem em cada loja e a sua localisação
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
									pipeline: [{ $project: { _id: 0, country: 1 } }], //apenas o nome do país
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
	{ $unwind: "$adress" }, //expandir array
	{ $unwind: "$adress.city" },
	{ $unwind: "$adress.city.country" },
	{
		$lookup: { //juntar inventário da loja
			from: "inventory",
			localField: "store_id",
			foreignField: "store_id",
			pipeline: [
				{
					$lookup: { //juntar filme
						from: "film",
						localField: "film_id",
						foreignField: "film_id",
						as: "film"
					}
				},
				{ $limit: 50 } //limitar a 50 filmes por loja
			],
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
			films: "$films.film.title" //titulos dos filmes
		}
	}
]).forEach((doc) => printjson(doc));