db = db.getSiblingDB('group_17_db');

print("Find Movie \"Within Our Gates\" by Title:");
// find movies by title
db.movies.find(
    { title: "Within Our Gates" },
    { title: 1, genres: 1, year: 1, plot: 1, actors: 1, _id: 0 }
)