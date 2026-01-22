//quantos filmes tem em cada loja e a sua localisação
db = db.getSiblingDB("sakila");

db.store.aggregate([
    { $lookup: {
        	from: "address",
        	localField: "address_id",
        	foreignField: "address_id",
            pipeline: [{
                $lookup: {
                    from: "city",
                	localField: "city_id",
                	foreignField: "city_id",
                    pipeline: [
                        { $lookup: {
                            from: "country",
                            localField: "country_id",
                            foreignField: "country_id",
                            pipeline: [{ $project: {_id: 0, country: 1} }],
                            as: "country"
                        } },
                        { $project: {
                            _id: 0,
                            city: 1,
                            country: 1
                        } }
                    ],
                    as: "city"
                    }
                },
                {$project: {
                _id: 0,
                address_id: 0,
                address2: 0,
                phone: 0,
                city_id: 0,
                postal_code: 0,
                location: 0,
                last_update: 0
            } },
            ],
            as: "adress"
        }
    },
    { $unwind: "$adress"},
    { $unwind: "$adress.city"},
    { $unwind: "$adress.city.country"},
    { $lookup: {
        from: "inventory",
        localField: "store_id",
        foreignField: "store_id",
        as: "films"
    } },
    { $project: {
        _id: 0,
        store_id: 1,
        adress: "$adress.address",
        city: "$adress.city.city",
        country: "$adress.city.country.country",
        numOfFilms: { $size: "$films" }
    } }
])
.forEach((doc) => printjson(doc));