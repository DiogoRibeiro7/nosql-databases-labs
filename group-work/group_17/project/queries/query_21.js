db = db.getSiblingDB('group_17_db');

print("Total number of theaters:");
// total number of theaters
db.theaters.countDocuments();