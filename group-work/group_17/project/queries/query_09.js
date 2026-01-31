db = db.getSiblingDB('group_17_db');

// update movie info
db.movies.updateOne(
    { _id: ObjectId("573a1390f29313caabcd587d")},
{
  $set: {
        type: "movie",
        title: "Second Movie",
        plot: "Small description",
        fullplot: "Full movie description",
        rated: "PG-13",
        lastupdated: new Date()
    }
})