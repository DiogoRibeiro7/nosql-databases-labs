// Mostra os países e que cidades a elas pertencem.
// Correr: mongosh queries/06_get_cities_by_country.mongosh.js

db = db.getSiblingDB("sakila");
db.country.aggregate([
	{
		$lookup: { //juntar cidades do pais
			from: "city",
			localField: "country_id",
			foreignField: "country_id",
			as: "cities"
		}
	},
	{
		$project: { //campos finais
			_id: 0,
			country_id: 1,
			country: 1, //nome do pais
			cities: {
				$map: { //mapear cidades
					input: "$cities",
					as: "c",
					in: {
						city_id: "$$c.city_id",
						city: "$$c.city"
					}
				}
			}
		}
	}
]).forEach(doc => printjson(doc));