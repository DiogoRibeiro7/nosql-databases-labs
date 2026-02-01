db = db.getSiblingDB('group_17_db');

// create a new comment
db.comments.insertOne({
    movie_id: ObjectId("573a1390f29313caabcd587d"),
    name: "New User",
    email: "newuser@gmail.com",
    text: "This is a new comment.",
    date: ISODate()
})