db = db.getSiblingDB("sakila");

db.film
    .aggregate([
    { $lookup: {
        from: "film_actor",
        localField: "film_id",
        foreignField: "film_id",
        pipeline: [
            {
                $lookup: {
                    from: "actor",
                    localField: "actor_id",
                    foreignField: "actor_id",
                    pipeline: [
                        {
                            $project: { 
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
                $project: { 
                    _id: 0,
                    film_id: 0,
                    actor_id: 0,
                    last_update: 0
                } 
            }
        ],
        as: "actor"
    } },
    { $project: {
        _id: 0,
        film_id: 0,
        language_id: 0,
        length: 0,
        last_update: 0
    } },
    { $sort: { _id: 1} },
    { $limit: 5 }
])
.forEach((doc) => printjson(doc));