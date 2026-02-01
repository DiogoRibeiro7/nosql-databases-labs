db = db.getSiblingDB('group_17_db');

print("Top 5 Theaters by City:");
// show theaters by city, display city and number of theaters, ordered by number of theaters per city
db.theaters.aggregate([
  { $group: { _id: "$location.address.city",theater_count: { $sum: 1 }}},
  { $sort: { theater_count: -1 } },
  { $limit: 5 },
  { $project: { _id: 0, city: "$_id", theaters: "$theater_count" }
  }
]);