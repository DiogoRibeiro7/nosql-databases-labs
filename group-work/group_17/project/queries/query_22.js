db = db.getSiblingDB('group_17_db');

print("Total number of theaters by state:");
// total number of theaters, grouped by state
db.theaters.aggregate([
    { $group: { _id: "$state", count: { $sum: 1 } } }
]);