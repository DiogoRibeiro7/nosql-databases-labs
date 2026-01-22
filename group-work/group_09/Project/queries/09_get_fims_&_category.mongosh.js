// Mostra os filmes e a sua respetiva categoria.
// Correr: mongosh queries/09_get_films_&_category.mongosh.js
db = db.getSiblingDB("sakila");

db.film_category.aggregate([
     {
     $lookup: {
        	from: "film",
        	localField: "film_id",
        	foreignField: "film_id",
          as: "film"
     } },
     {
     $lookup: {
        	from: "category",
        	localField: "category",
        	foreignField: "category",
          as: "category"
     } },
     { $unwind: "$category" },
     { $unwind: "$film" },
     { $project: {
        _id: 0,
        film: "$film.title",
        category: "$category.name"
     } },
])
.forEach((doc) => printjson(doc));