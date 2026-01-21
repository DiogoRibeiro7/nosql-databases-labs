// Mostra as cidades e que endereços a elas pertencem.
// Correr: mongosh queries/05_get_adresses_by_city.mongosh.js

db = db.getSiblingDB("sakila");
db.city.aggregate([
	{
		$lookup: {
			from: "address",
			localField: "city_id",
			foreignField: "city_id",
			as: "addresses"
		}
	},
	{
		$project: {
			_id: 0,
			City: "$city",
			Addresses: {
				$map: {
					input: "$addresses",
					as: "a",
					in: {
						address_id: "$$a.address_id",
						address: "$$a.address",
						district: "$$a.district",
						postal_code: "$$a.postal_code"
					}
				}
			}
		}
	}
]).forEach(doc => printjson(doc));