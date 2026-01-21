db = db.getSiblingDB("sakila");

const bbc = db.film.aggregate(
     {$group : { _id : '$film_id', count : {$sum : 1}}},
     {$sort: { _id: 1 } }
)
.forEach((doc) => printjson(doc));

console.log(bbc)