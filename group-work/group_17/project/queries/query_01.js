db = db.getSiblingDB('group_17_db');

print("Movies with Highest IMDB Rating:");
// shows movies with highest imdb rating, displaying title, rating and number of reviews
db.movies.aggregate([
    { $match: { "imdb.rating": { $type: "number" }} },
    { $sort: { "imdb.rating": -1, "imdb.votes": -1 } },
    { $project: { _id: 0, title: 1, rating: "$imdb.rating", reviews: "$imdb.votes" } },
    // limit to 5 results
    { $limit: 5 }
]);