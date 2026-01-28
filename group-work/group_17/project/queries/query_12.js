db = db.getSiblingDB('group_17_db');

// update comment by id
db.comments.updateOne(
    { _id: ObjectId("5a9427648b0beebeb69579e7") },
    { $set: { text: "Updated comment text." } }
)