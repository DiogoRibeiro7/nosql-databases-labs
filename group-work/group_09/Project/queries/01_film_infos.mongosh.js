// Mostra os dados de cada filme, incluindo atores, categoria e tipo de filme.
// Correr: mongosh queries/01_film_infos.mongosh.js

db = db.getSiblingDB("sakila");

db.film.aggregate([
	{
		$lookup: { //juntar categorias do filme
			from: "film_category",
			localField: "film_id",
			foreignField: "film_id",
			pipeline: [
				{
					$lookup: { //buscar nome da categoria
						from: "category",
						localField: "category_id",
						foreignField: "category_id",
						pipeline: [
							{
								$project: { //excluir campos desnecessários
									_id: 0,
									category_id: 0,
									last_update: 0
								}
							}
						],
						as: "category"
					},
				},
				{
					$project: { //excluir campos desnecessários
						_id: 0,
						film_id: 0,
						category_id: 0,
						last_update: 0
					}
				}
			],
			as: "category" //campo final
		}
	},
	{
		$lookup: { //buscar linguagem
			from: "language",
			localField: "language_id",
			foreignField: "language_id",
			pipeline: [{
				$project: { //excluir campos desnecessários
					_id: 0,
					language_id: 0,
					last_update: 0
				}
			}],
			as: "linguagem"
		}
	},
	{ $unwind: "$category" }, //expandir as listas
	{ $unwind: "$category.category" },
	{ $unwind: "$linguagem" },

	{
		$lookup: { //juntar atores
			from: "film_actor",
			localField: "film_id",
			foreignField: "film_id",
			pipeline: [
				{
					$lookup: { //buscar nome do ator
						from: "actor",
						localField: "actor_id",
						foreignField: "actor_id",
						pipeline: [
							{
								$project: { //remover campos
									_id: 0,
									actor_id: 0,
									last_update: 0
								}
							}
						],
						as: "nome"
					}
				},
				{
					$project: { //excluir campos desnecessários
						_id: 0,
						film_id: 0,
						actor_id: 0,
						last_update: 0
					}
				}
			],
			as: "actor"
		}
	},
	{
		$project: { //campos finais
			_id: 0,
			title: 1,
			description: 1,
			category: "$category.category.name",
			release_year: 1,
			rental_duration: 1,
			rental_rate: 1,
			replacement_cost: 1,
			rating: 1,
			special_features: 1,
			linguagem: "$linguagem.name",
			actor: 1,
		}
	},
	{ $sort: { _id: 1 } }, //ordenar por id
	{ $limit: 5 } //limitar a 5
]).forEach((doc) => printjson(doc)); //mostrar resultado