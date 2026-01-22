db = db.getSiblingDB('group_17_db');

print("Total number of users:");
// total number of users
db.users.countDocuments();