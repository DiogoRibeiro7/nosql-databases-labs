
db = db.getSiblingDB("group_10_db");

// Filmes alugados mais recentemente por cada loja
db.rentals.aggregate([
  { $unwind: "$films" },
  { $sort: { rentalDate: -1 } },
  { $group: {
      _id: "$storeId",
      lastFilmRented: { $first: "$films.title" },
      lastDate: { $first: "$rentalDate" }
  }}
]).forEach(printjson);

