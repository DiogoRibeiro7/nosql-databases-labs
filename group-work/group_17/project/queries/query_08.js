db = db.getSiblingDB('group_17_db');

// delete movie
db.movies.deleteOne(
    { _id: ObjectId("573a1390f29313caabcd587d") }
)