db = db.getSiblingDB('group_17_db');

// delete user by email
db.users.deleteOne(
    { email: "newuser@gmail.com" }
)