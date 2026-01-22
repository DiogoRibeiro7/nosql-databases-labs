//listar os filmes que conteem o "the"
// Correr: mongosh queries/16_get_movies_the.mongosh.js
db = db.getSiblingDB("sakila");
db.film.find({ title: { $regex: "the", $options: "i" } }, 
    {_id: 0, original_language_id: 0, language_id:0, last_update: 0 } )
    .forEach(doc => printjson(doc));