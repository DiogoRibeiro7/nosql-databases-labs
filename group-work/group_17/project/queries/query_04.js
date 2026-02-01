db = db.getSiblingDB('group_17_db');

// create a new movie
db.movies.insertOne({
    type: "movie",
    title: "New Movie",
    genres: ["Drama", "Thriller"],
    plot: "Small description",
    fullplot: "Full movie description",
    countries: ["USA"],
    directors: ["Director Name"],
    rated: "PG-13",
    cast: ["Actor 1", "Actor 2"],
    year: 2026,
    imdb: {
        rating: 7.5,
        votes: 1500,
        id: 1234567
    },
    "lastupdated": ISODate()
})