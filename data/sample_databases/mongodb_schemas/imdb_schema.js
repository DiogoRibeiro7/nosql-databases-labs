
// Suggested MongoDB Collections:
// 1. movies (with embedded ratings and crew)
// 2. people (actors/directors with filmography references)

db.movies.insertOne({
  tconst: "tt0111161",
  title: "The Shawshank Redemption",
  year: 1994,
  runtime_minutes: 142,
  genres: ["Drama"],
  rating: {
    average: 9.3,
    num_votes: 2343110
  },
  directors: [
    { nconst: "nm0001104", name: "Frank Darabont" }
  ],
  cast: [
    { nconst: "nm0000209", name: "Tim Robbins", character: "Andy Dufresne" },
    { nconst: "nm0000151", name: "Morgan Freeman", character: "Ellis Redding" }
  ]
});
