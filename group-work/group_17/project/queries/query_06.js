db = db.getSiblingDB('group_17_db');

// finds movies by genres, displaying small information about each movie
print("Find \"Drama\" Movies:");
db.movies.find(
    { genres: "Drama" },
    { title: 1, genres: 1, year: 1, plot: 1, actors: 1, _id: 0 },
    { limit: 5 }
)