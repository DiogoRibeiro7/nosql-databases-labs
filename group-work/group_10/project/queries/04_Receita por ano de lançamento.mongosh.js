
// receita total por ano de lançamento (via join com films)
// Usage: mongosh queries/15_receita_por_release_year.mongosh.js

db.rentals.aggregate([
  { $match: { status: "returned" } },
  { $unwind: "$films" }, //Separar os filmes dentro de cada aluguer

  { $lookup: { //Ir buscar dados do filme à coleção films (Join), Em rentals não existe releaseYear.
      from: "films",
      localField: "films.filmId",
      foreignField: "filmId",
      as: "filmDoc"
  }},
  { $unwind: "$filmDoc" }, //Converter filmDoc de array para objeto O $lookup devolve sempre um array

  { $group: { //Agrupar por ano de lançamento do filme
      _id: "$filmDoc.releaseYear",
      revenue: { $sum: "$films.amount" },
      rentals: { $sum: 1 }
  }},
  { $sort: { revenue: -1 } } //Ordenar pelos anos mais rentáveis
]).forEach(printjson); 
