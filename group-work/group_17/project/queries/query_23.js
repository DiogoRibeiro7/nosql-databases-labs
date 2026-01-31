db = db.getSiblingDB('group_17_db');

print("Total number of comments:");
// total number of comments
db.comments.countDocuments();