db = db.getSiblingDB('group_17_db');

print("Top 5 users with most comments:");
// top 5 users with most comments
db.comments.aggregate([
    { $group: { _id: "$name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
]);