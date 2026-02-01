db = db.getSiblingDB('group_17_db');

// encrypt password before storing
const bcrypt = require("bcrypt");

const plainPassword = "winterIsComing";
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// create a new user
db.users.insertOne({
    name: "New User",
    email: "newuser@gmail.com",
    password: hashedPassword
})