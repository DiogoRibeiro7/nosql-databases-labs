db = db.getSiblingDB('group_17_db');

print("Top 5 Users with Most Comments:");
// top 5 users with most comments
db.comments.aggregate([
    { $group: { _id: "$email", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "email",
        as: "user_info"
    }},
    { $unwind: "$user_info" },
    { $project: {
        _id: 0,
        name: "$user_info.name",
        email: "$_id",
        comment_count: "$count"
    }},
    { $limit: 5 }
]);