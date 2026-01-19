
db = db.getSiblingDB("group_10_db");

db.rentals.aggregate([
  { $group: {
      _id: "$status",
      count: { $sum: 1 }
  }},
  { $sort: { count: -1 } }
]);

