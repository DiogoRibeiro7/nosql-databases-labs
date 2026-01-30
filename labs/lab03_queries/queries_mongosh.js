// Lab 03 - Complex Queries
// Database: lab03_movies
// Collection: movies, theaters, users

// Switch to lab03_movies database
db = db.getSiblingDB("lab03_movies");

// ========================================
// TASK 1: COMPLEX QUERIES
// ========================================

// 1. Find all movies released between 2010 and 2020 with IMDb rating > 8.0
db.movies
  .find({
    year: { $gte: 2010, $lte: 2020 },
    "imdb.rating": { $gt: 8.0 },
  })
  .sort({ "imdb.rating": -1 });





// With projection (cleaner output)
db.movies
  .find(
    {
      year: { $gte: 2010, $lte: 2020 },
      "imdb.rating": { $gt: 8.0 },
    },
    {
      title: 1,
      year: 1,
      "imdb.rating": 1,
      genres: 1,
      _id: 0,
    }
  )
  .sort({ "imdb.rating": -1 });

  //Result
  /*
    {
    _id: ObjectId('573a13e9f29313caabdcc734'),
    plot: 'A Welsh teenager will become the cool kid of the town if a deal is made with his new American neighbour.',
    genres: [ 'Comedy' ],
    runtime: 84,
    cast: [
      'Emile Hirsch',
      'Craig Roberts',
      'Richard Harrington',
      'Mark Lewis Jones'
    ],
    poster: 'https://m.media-amazon.com/images/M/MV5BMTk3NjE1NzM2Ml5BMl5BanBnXkFtZTgwMzI1NDQ3NTE@._V1_SY1000_SX677_AL_.jpg',
    title: 'Just Jim',
    fullplot: 'A Welsh teenager will become the cool kid of the town if a deal is made with his new American neighbour.',
    languages: [ 'English' ],
    released: ISODate('2015-03-14T00:00:00.000Z'),
    directors: [ 'Craig Roberts' ],
    writers: [ 'Craig Roberts' ],
    awards: { wins: 0, nominations: 1, text: '1 nomination.' },
    lastupdated: '2015-08-02 00:23:47.370000000',
    year: 2015,
    imdb: { rating: 8.7, votes: 75, id: 3291148 },
    countries: [ 'UK' ],
    type: 'movie'
  },
  {
    _id: ObjectId('573a13e0f29313caabdbad3a'),
    plot: "The friendship of Rabbit and Deer is put to the test by Deer's new obsession to find the formula for the 3rd dimension...",
    genres: [ 'Animation', 'Short', 'Adventure' ],
    runtime: 17,
    cast: [ 'Mèrocz Adrienn', 'Dèniel Czupi' ],
    poster: 'https://m.media-amazon.com/images/M/MV5BMjM2Nzk2MTQwNV5BMl5BanBnXkFtZTgwMTE3Nzc1MjE@._V1_SY1000_SX677_AL_.jpg',
    title: 'Rabbit and Deer',
    fullplot: "The friendship of Rabbit and Deer is put to the test by Deer's new obsession to find the formula for the 3rd dimension...",
    countries: [ 'Hungary' ],
    released: ISODate('2014-03-29T00:00:00.000Z'),
    directors: [ 'Pèter Vècz' ],
    writers: [ 'Pèter Vècz (story)' ],
    awards: { wins: 18, nominations: 1, text: '18 wins & 1 nomination.' },
    lastupdated: '2015-07-17 00:49:35.567000000',
    year: 2013,
    imdb: { rating: 8.7, votes: 837, id: 2664910 },
    type: 'movie'
  }
*/


// ========================================
// 2. Find all movies in "Drama" or "Thriller" genres with at least one award
db.movies
  .find({
    genres: { $in: ["Drama", "Thriller"] },
    "awards.wins": { $gte: 1 },
  })
  .sort({ "awards.wins": -1 });

//Result 
/*{
    _id: ObjectId('573a13d5f29313caabd9cae7'),
    fullplot: "Based on an incredible true story of one man's fight for survival and freedom. In the pre-Civil War United States, Solomon Northup (Chiwetel Ejiofor), a free black man from upstate New York, is abducted and sold into slavery. Facing cruelty (personified by a malevolent slave owner, portrayed by Michael Fassbender), as well as unexpected kindnesses, Solomon struggles not only to stay alive, but to retain his dignity. In the twelfth year of his unforgettable odyssey, Solomon's chance meeting with a Canadian abolitionist (Brad Pitt) will forever alter his life.",
    imdb: { rating: 8.1, votes: 363143, id: 2024544 },
    year: 2013,
    plot: 'In the antebellum United States, Solomon Northup, a free black man from upstate New York, is abducted and sold into slavery.',
    genres: [ 'Biography', 'Drama', 'History' ],
    rated: 'R',
    metacritic: 97,
    title: '12 Years a Slave',
    lastupdated: '2015-08-22 00:05:56.030000000',
    languages: [ 'English' ],
    writers: [
      'John Ridley (screenplay)',
      'Solomon Northup (based on "Twelve Years a Slave" by)'
    ],
    type: 'movie',
    tomatoes: {
      viewer: { rating: 0, numReviews: 0 },
      lastUpdated: ISODate('2015-08-22T18:57:07.000Z')
    },
    poster: 'https://m.media-amazon.com/images/M/MV5BMjExMTEzODkyN15BMl5BanBnXkFtZTcwNTU4NTc4OQ@@._V1_SY1000_SX677_AL_.jpg',
    num_mflix_comments: 2,
    released: ISODate('2013-11-08T00:00:00.000Z'),
    awards: {
      wins: 267,
      nominations: 256,
      text: 'Won 3 Oscars. Another 264 wins & 256 nominations.'
    },
    countries: [ 'USA', 'UK' ],
    cast: [
      'Chiwetel Ejiofor',
      'Dwight Henry',
      'Dickie Gravois',
      'Bryan Batt'
    ],
    directors: [ 'Steve McQueen' ],
    runtime: 134
  },*/


// Alternative using $or
db.movies.find({
  $or: [{ genres: "Drama" }, { genres: "Thriller" }],
  "awards.wins": { $gte: 1 },
});

// ========================================
// 3. Find all movies where Tom Hanks appears in the cast
db.movies.find({
  cast: "Tom Hanks",
});

/*Result:

poster: 'https://m.media-amazon.com/images/M/MV5BMTY5MzYzNjc5NV5BMl5BanBnXkFtZTYwNTUyNTc2._V1_SY1000_SX677_AL_.jpg',
    num_mflix_comments: 381,
    released: ISODate('2002-12-25T00:00:00.000Z'),
    awards: {
      wins: 15,
      nominations: 27,
      text: 'Nominated for 2 Oscars. Another 13 wins & 27 nominations.'
    },
    countries: [ 'USA', 'Canada' ],
    cast: [
      'Leonardo DiCaprio',
      'Tom Hanks',
      'Christopher Walken',
      'Martin Sheen'
    ],
    directors: [ 'Steven Spielberg' ],
    runtime: 141
  }*/

// With formatted output
db.movies
  .find({ cast: "Tom Hanks" }, { title: 1, year: 1, cast: 1, "imdb.rating": 1, _id: 0 })
  .sort({ year: -1 });

  /*Result: {
    imdb: { rating: 8 },
    year: 2002,
    title: 'Catch Me If You Can',
    cast: [
      'Leonardo DiCaprio',
      'Tom Hanks',
      'Christopher Walken',
      'Martin Sheen'
    ]
  }*/

// Using regex for partial match  procurar padrões de texto i → opção case-insensitive (ignora maiúsculas/minúsculas)
db.movies.find({
  cast: { $regex: /Tom Hanks/i },
});
/*Result 
 fullplot: "The owner of a large bookstore chain starts putting the owner of a small local bookstore out of business. Meanwhile they have been corresponding over the internet without knowing who either of them are. They can't stand each other in person but over the internet they are very attracted. He finds out who she is but she doesn't know. He starts to like her more but she still hates him. He has to fix it.",
    imdb: { rating: 6.5, votes: 139830, id: 128853 },
    year: 1998,
    plot: 'Two business rivals hate each other at the office but fall in love over the internet.',
    genres: [ 'Comedy', 'Drama', 'Romance' ],
    rated: 'PG',
    metacritic: 57,
    title: "You've Got Mail",
    lastupdated: '2015-09-07 00:17:22.163000000',
    languages: [ 'English' ],
    writers: [
      'Miklès Lèszlè (play)',
      'Nora Ephron (screenplay)',
      'Delia Ephron (screenplay)'
    ],
    type: 'movie',
    tomatoes: {
      website: 'http://www.youvegotmail.com',
      viewer: { rating: 3.1, numReviews: 461550, meter: 73 },
      dvd: ISODate('1999-05-04T00:00:00.000Z'),
      critic: { rating: 6.2, numReviews: 83, meter: 69 },
      lastUpdated: ISODate('2015-09-16T17:47:27.000Z'),
      consensus: 'Great chemistry between the leads made this a warm and charming delight.',
      rotten: 26,
      production: 'Warner Bros. Pictures',
      fresh: 57
    },
    poster: 'https://m.media-amazon.com/images/M/MV5BZTcxNzgzZjMtYzZiZC00MmE1LTg3MzQtZDAxMTYyZWE4MDNhL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SY1000_SX677_AL_.jpg',
    num_mflix_comments: 1,
    released: ISODate('1998-12-18T00:00:00.000Z'),
    awards: {
      wins: 6,
      nominations: 7,
      text: 'Nominated for 1 Golden Globe. Another 5 wins & 7 nominations.'
    },
    countries: [ 'USA' ],
    cast: [ 'Tom Hanks', 'Meg Ryan', 'Greg Kinnear', 'Parker Posey' ],
    directors: [ 'Nora Ephron' ],
    runtime: 119
  },
  {
    _id: ObjectId('573a13a4f29313caabd0f756'),
    plot: 'Produced by Steven Spielberg and presented by Tom Hanks this documentary tells how war photographers faced the horrors that looked both in Europe and in the Pacific during World War II .',
    genres: [ 'Documentary' ],
    runtime: 88,
    cast: [
      'Tom Hanks',
      'Stephen Ambrose',
      'Russ Meyer',
      'Walter Rosenblum'
    ],
    title: 'Shooting War',
    fullplot: 'Produced by Steven Spielberg and presented by Tom Hanks this documentary tells how war photographers faced the horrors that looked both in Europe and in the Pacific during World War II .',
    languages: [ 'English' ],
    released: ISODate('2000-12-07T00:00:00.000Z'),
    directors: [ 'Richard Schickel' ],
    writers: [ 'Richard Schickel' ],
    awards: {
      wins: 0,
      nominations: 2,
      text: 'Nominated for 1 Primetime Emmy. Another 1 nomination.'
    },
    lastupdated: '2015-09-17 04:42:02.380000000',
    year: 2000,
    imdb: { rating: 7.9, votes: 361, id: 250730 },
    countries: [ 'USA' ],
    type: 'movie',
    tomatoes: {
      viewer: { rating: 3.9, numReviews: 7032, meter: 84 },
      lastUpdated: ISODate('2015-06-08T18:11:55.000Z')
    }
  },*/
// ========================================
// 4. Find movies released in last 5 years, sorted by rating, top 20
const currentYear = 2024;
const fiveYearsAgo = currentYear - 5;

db.movies
  .find({
    year: { $gte: fiveYearsAgo },
  })
  .sort({ "imdb.rating": -1 })
  .limit(20);

// With projection
db.movies
  .find({ year: { $gte: 2019 } }, { title: 1, year: 1, "imdb.rating": 1, genres: 1, _id: 0 })
  .sort({ "imdb.rating": -1 })
  .limit(20);

  /*Result db.movies.find({year:{$gte:2016}},{ title: 1, year: 1, "imdb.rating": 1, genres: 1, _id: 0  }).sort({"imdb.rating":-1}).limit(20)
  
  [
  {
    genres: [ 'Action', 'Biography', 'Crime' ],
    title: 'The Masked Saint',
    year: 2016,
    imdb: { rating: '' }
  }
]*/


// ========================================
// 5. Find all theaters in New York with screenings scheduled for today
const today = new Date("2024-11-18");
const tomorrow = new Date("2024-11-19");

db.theaters.find({
  "location.city": "New York",
  "screenings.time": {
    $gte: today,
    $lt: tomorrow,
  },
});

// Alternative: Check if screenings array is not empty
db.theaters.find({
  "location.city": "New York",
  screenings: { $exists: true, $ne: [] },
});

// ========================================
// 6. Find users who watched >50 movies and prefer "Sci-Fi"
db.users.find({
  total_movies_watched: { $gt: 50 },
  "preferences.favorite_genres": "Sci-Fi",
});

// With projection
db.users.find(
  {
    total_movies_watched: { $gt: 50 },
    "preferences.favorite_genres": "Sci-Fi",
  },
  {
    username: 1,
    total_movies_watched: 1,
    "preferences.favorite_genres": 1,
    _id: 0,
  }
);

// ========================================
// 7. Find movies with runtime between 90-120 minutes, excluding documentaries
db.movies
  .find({
    runtime: { $gte: 90, $lte: 120 },
    genres: { $ne: "Documentary" },
  })
  .sort({ "imdb.rating": -1 });

// Alternative: Explicitly exclude documentaries
db.movies.find({
  $and: [{ runtime: { $gte: 90, $lte: 120 } }, { genres: { $nin: ["Documentary"] } }],
});

// ========================================
// 8. Text search: Find movies with "space" or "alien" in title or plot
// First, create text index (if not exists)
db.movies.createIndex({ title: "text", plot: "text" });

// Then search
db.movies.find({
  $text: { $search: "space alien" },
});

// With relevance score
db.movies
  .find(
    { $text: { $search: "space alien" } },
    { score: { $meta: "textScore" }, title: 1, plot: 1, year: 1 }
  )
  .sort({ score: { $meta: "textScore" } });

// Search for exact phrase
db.movies.find({
  $text: { $search: '"outer space"' },
});

// ========================================
// ADDITIONAL USEFUL QUERIES
// ========================================

// 9. Find movies by specific director with high ratings
db.movies
  .find({
    directors: "Christopher Nolan",
    "imdb.rating": { $gte: 8.0 },
  })
  .sort({ year: -1 });

// 10. Find movies with multiple genres
db.movies.find({
  $expr: { $gt: [{ $size: "$genres" }, 2] },
});

// 11. Find movies with cast array size greater than 4
db.movies.find({
  $expr: { $gte: [{ $size: "$cast" }, 5] },
});

// 12. Find highly-rated but not highly-awarded movies
db.movies.find({
  "imdb.rating": { $gte: 8.5 },
  "awards.wins": { $lt: 50 },
});

// 13. Find movies in specific language
db.movies.find({
  languages: "English",
});

// 14. Find movies released in specific decade (2010s)
db.movies.find({
  year: { $gte: 2010, $lt: 2020 },
});

// 15. Find movies with regex on title (case-insensitive)
db.movies.find({
  title: { $regex: /the/i },
});

// 16. Find movies with elemMatch (complex array conditions)
db.users.find({
  viewing_history: {
    $elemMatch: {
      user_rating: { $gte: 9.0 },
      watched_date: { $gte: "2024-01-01" },
    },
  },
});

// 17. Count movies by genre (simple aggregation alternative)
db.movies.distinct("genres");

// 18. Find theaters with capacity > 2000
db.theaters
  .find({
    capacity: { $gt: 2000 },
  })
  .sort({ capacity: -1 });

// 19. Find users created in 2022
db.users.find({
  created_at: {
    $gte: new Date("2022-01-01"),
    $lt: new Date("2023-01-01"),
  },
});

// 20. Find movies where Leonardo DiCaprio and Tom Hanks are not in cast
db.movies.find({
  cast: {
    $nin: ["Leonardo DiCaprio", "Tom Hanks"],
  },
});

// ========================================
// QUERY WITH EXPLAIN (Performance Analysis)
// ========================================

// Check execution plan for genre query
db.movies.find({ genres: "Action" }).explain("executionStats");

// Check execution plan for year + rating query
db.movies
  .find({
    year: 2015,
    "imdb.rating": { $gt: 7.0 },
  })
  .explain("executionStats");

// Check execution plan for director query
db.movies.find({ directors: "Christopher Nolan" }).explain("executionStats");

// ========================================
// COVERED QUERIES (All data from index)
// ========================================

// After creating index on title and year:
// db.movies.createIndex({ title: 1, year: 1 });

// This query can be covered (all data from index)
db.movies.find({ title: "Inception" }, { title: 1, year: 1, _id: 0 });

// ========================================
// COMPOUND QUERIES
// ========================================

// Complex query with multiple conditions
db.movies
  .find({
    $and: [
      { year: { $gte: 2010 } },
      { "imdb.rating": { $gte: 8.0 } },
      { genres: "Sci-Fi" },
      { "awards.wins": { $gte: 10 } },
    ],
  })
  .sort({ "imdb.rating": -1 });

// Using $nor (neither condition is true)
db.movies.find({
  $nor: [{ genres: "Horror" }, { genres: "Documentary" }],
});
