
db = db.getSiblingDB("group_10_db");

db.rentals.aggregate([
  { $unwind: "$films" },
  { $group: {
      _id: "$films.filmId",
      title: { $first: "$films.title" },
      revenue: { $sum: "$films.amount" }
  }},
  { $sort: { revenue: -1 } }
]).forEach(printjson);

