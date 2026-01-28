//listar os filmes que conteem o "the"
// Correr: mongosh queries/16_get_movies_the.mongosh.js
db = db.getSiblingDB("sakila");
db.film.find(
	{ title: { $regex: "^the", $options: "i" } }, //filmes cujo título começa com "the" (ignorar maiúsculas/minúsculas)
	{ _id: 0, original_language_id: 0, language_id: 0, last_update: 0 } //excluir campos desnecessários
).forEach(doc => printjson(doc));