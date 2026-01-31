db = db.getSiblingDB('group_17_db');

// delete comment by id
db.comments.deleteOne(
    { _id: ObjectId("5a9427648b0beebeb69579e7") }
)