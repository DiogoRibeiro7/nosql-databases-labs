// Lab 03 - Complex Queries
// Database: lab03_movies
// Collection: movies, theaters, users

// Switch to lab03_movies database
db = db.getSiblingDB("lab03_movies")

// ========================================
// TASK 1: COMPLEX QUERIES
// ========================================

// 1. Find all movies released between 2010 and 2020 with IMDb rating > 8.0
db.movies.find({
  year: { $gte: 2010, $lte: 2020 },
  "imdb.rating": { $gt: 8.0 }
}).sort({ "imdb.rating": -1 });

// With projection (cleaner output)
db.movies.find(
  {
    year: { $gte: 2010, $lte: 2020 },
    "imdb.rating": { $gt: 8.0 }
  },
  {
    title: 1,
    year: 1,
    "imdb.rating": 1,
    genres: 1,
    _id: 0
  }
).sort({ "imdb.rating": -1 });

// ========================================
// 2. Find all movies in "Drama" or "Thriller" genres with at least one award
db.movies.find({
  genres: { $in: ["Drama", "Thriller"] },
  "awards.wins": { $gte: 1 }
}).sort({ "awards.wins": -1 });

// Alternative using $or
db.movies.find({
  $or: [
    { genres: "Drama" },
    { genres: "Thriller" }
  ],
  "awards.wins": { $gte: 1 }
});

// ========================================
// 3. Find all movies where Tom Hanks appears in the cast
db.movies.find({
  cast: "Tom Hanks"
});

// With formatted output
db.movies.find(
  { cast: "Tom Hanks" },
  { title: 1, year: 1, cast: 1, "imdb.rating": 1, _id: 0 }
).sort({ year: -1 });

// Using regex for partial match
db.movies.find({
  cast: { $regex: /Tom Hanks/i }
});

// ========================================
// 4. Find movies released in last 5 years, sorted by rating, top 20
const currentYear = 2024;
const fiveYearsAgo = currentYear - 5;

db.movies.find({
  year: { $gte: fiveYearsAgo }
}).sort({ "imdb.rating": -1 }).limit(20);

// With projection
db.movies.find(
  { year: { $gte: 2019 } },
  { title: 1, year: 1, "imdb.rating": 1, genres: 1, _id: 0 }
).sort({ "imdb.rating": -1 }).limit(20);

// ========================================
// 5. Find all theaters in New York with screenings scheduled for today
const today = new Date("2024-11-18");
const tomorrow = new Date("2024-11-19");

db.theaters.find({
  "location.city": "New York",
  "screenings.time": {
    $gte: today,
    $lt: tomorrow
  }
});

// Alternative: Check if screenings array is not empty
db.theaters.find({
  "location.city": "New York",
  screenings: { $exists: true, $ne: [] }
});

// ========================================
// 6. Find users who watched >50 movies and prefer "Sci-Fi"
db.users.find({
  total_movies_watched: { $gt: 50 },
  "preferences.favorite_genres": "Sci-Fi"
});

// With projection
db.users.find(
  {
    total_movies_watched: { $gt: 50 },
    "preferences.favorite_genres": "Sci-Fi"
  },
  {
    username: 1,
    total_movies_watched: 1,
    "preferences.favorite_genres": 1,
    _id: 0
  }
);

// ========================================
// 7. Find movies with runtime between 90-120 minutes, excluding documentaries
db.movies.find({
  runtime: { $gte: 90, $lte: 120 },
  genres: { $ne: "Documentary" }
}).sort({ "imdb.rating": -1 });

// Alternative: Explicitly exclude documentaries
db.movies.find({
  $and: [
    { runtime: { $gte: 90, $lte: 120 } },
    { genres: { $nin: ["Documentary"] } }
  ]
});

// ========================================
// 8. Text search: Find movies with "space" or "alien" in title or plot
// First, create text index (if not exists)
db.movies.createIndex({ title: "text", plot: "text" });

// Then search
db.movies.find({
  $text: { $search: "space alien" }
});

// With relevance score
db.movies.find(
  { $text: { $search: "space alien" } },
  { score: { $meta: "textScore" }, title: 1, plot: 1, year: 1 }
).sort({ score: { $meta: "textScore" } });

// Search for exact phrase
db.movies.find({
  $text: { $search: "\"outer space\"" }
});

// ========================================
// ADDITIONAL USEFUL QUERIES
// ========================================

// 9. Find movies by specific director with high ratings
db.movies.find({
  directors: "Christopher Nolan",
  "imdb.rating": { $gte: 8.0 }
}).sort({ year: -1 });

// 10. Find movies with multiple genres
db.movies.find({
  $expr: { $gt: [{ $size: "$genres" }, 2] }
});

// 11. Find movies with cast array size greater than 4
db.movies.find({
  $expr: { $gte: [{ $size: "$cast" }, 5] }
});

// 12. Find highly-rated but not highly-awarded movies
db.movies.find({
  "imdb.rating": { $gte: 8.5 },
  "awards.wins": { $lt: 50 }
});

// 13. Find movies in specific language
db.movies.find({
  languages: "English"
});

// 14. Find movies released in specific decade (2010s)
db.movies.find({
  year: { $gte: 2010, $lt: 2020 }
});

// 15. Find movies with regex on title (case-insensitive)
db.movies.find({
  title: { $regex: /the/i }
});

// 16. Find movies with elemMatch (complex array conditions)
db.users.find({
  viewing_history: {
    $elemMatch: {
      user_rating: { $gte: 9.0 },
      watched_date: { $gte: "2024-01-01" }
    }
  }
});

// 17. Count movies by genre (simple aggregation alternative)
db.movies.distinct("genres");

// 18. Find theaters with capacity > 2000
db.theaters.find({
  capacity: { $gt: 2000 }
}).sort({ capacity: -1 });

// 19. Find users created in 2022
db.users.find({
  created_at: {
    $gte: new Date("2022-01-01"),
    $lt: new Date("2023-01-01")
  }
});

// 20. Find movies where Leonardo DiCaprio and Tom Hanks are not in cast
db.movies.find({
  cast: {
    $nin: ["Leonardo DiCaprio", "Tom Hanks"]
  }
});

// ========================================
// QUERY WITH EXPLAIN (Performance Analysis)
// ========================================

// Check execution plan for genre query
db.movies.find({ genres: "Action" }).explain("executionStats");

// Check execution plan for year + rating query
db.movies.find({
  year: 2015,
  "imdb.rating": { $gt: 7.0 }
}).explain("executionStats");

// Check execution plan for director query
db.movies.find({ directors: "Christopher Nolan" }).explain("executionStats");

// ========================================
// COVERED QUERIES (All data from index)
// ========================================

// After creating index on title and year:
// db.movies.createIndex({ title: 1, year: 1 });

// This query can be covered (all data from index)
db.movies.find(
  { title: "Inception" },
  { title: 1, year: 1, _id: 0 }
);

// ========================================
// COMPOUND QUERIES
// ========================================

// Complex query with multiple conditions
db.movies.find({
  $and: [
    { year: { $gte: 2010 } },
    { "imdb.rating": { $gte: 8.0 } },
    { genres: "Sci-Fi" },
    { "awards.wins": { $gte: 10 } }
  ]
}).sort({ "imdb.rating": -1 });

// Using $nor (neither condition is true)
db.movies.find({
  $nor: [
    { genres: "Horror" },
    { genres: "Documentary" }
  ]
});
