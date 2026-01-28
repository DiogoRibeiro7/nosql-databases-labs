
db = db.getSiblingDB("group_10_db");

db.rentals.aggregate([
  { $unwind: "$films" },
  { $group: {
      _id: { month: { $month: "$rentalDate" } },
      revenue: { $sum: "$films.amount" }
  }},
  { $sort: { "_id.month": 1 } }
])
