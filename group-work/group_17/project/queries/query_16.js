db = db.getSiblingDB('group_17_db');

// update user info by email
db.users.updateOne(
    { email: "newuser@gmail.com" },
    { $set: { name: "Another User" } }
)  