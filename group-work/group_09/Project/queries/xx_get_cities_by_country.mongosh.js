db.country.aggregate([
	{
		$lookup: {
			from: "city",
			localField: "country_id",
			foreignField: "country_id",
			as: "cities"
		}
	},
	{
		$project: {
			_id: 0,
			country_id: 1,
			country: 1,
			cities: {
				$map: {
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