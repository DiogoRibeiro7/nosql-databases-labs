
// receita total por ano de lançamento (via join com films)
// Usage: mongosh queries/15_receita_por_release_year.mongosh.js

db.rentals.aggregate([
  { $match: { status: "returned" } },
  { $unwind: "$films" },
  { $lookup: {
      from: "films",
      localField: "films.filmId",
      foreignField: "filmId",
      as: "filmDoc"
  }},
  { $unwind: "$filmDoc" },
  { $group: {
      _id: "$filmDoc.releaseYear",
      revenue: { $sum: "$films.amount" },
      rentals: { $sum: 1 }
  }},
  { $sort: { revenue: -1 } }
]).forEach(printjson);
