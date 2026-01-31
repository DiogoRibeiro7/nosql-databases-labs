db = db.getSiblingDB('group_17_db');

// find movies by actor
print("Movies with Actor 1:");
db.movies.find(
    { cast: "Actor 1" },
    { title: 1, genres: 1, year: 1, plot: 1, actors: 1, _id: 0 },
    { limit: 5 }
)