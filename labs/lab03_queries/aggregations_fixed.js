// Lab 03 - Aggregation Pipelines (Fixed version with output)
// Database: lab03_movies
// Collection: movies, theaters, users

// Switch to database
db = db.getSiblingDB("lab03_movies");

print("\n========================================");
print("TASK 2: AGGREGATION PIPELINE");
print("========================================\n");

// ========================================
// 1. Average IMDb rating by genre
// ========================================
print("1. Average IMDb rating by genre:");
print("-".repeat(50));

const ratingsByGenre = db.movies.aggregate([
  // Unwind genres array (each movie may have multiple genres)
  { $unwind: "$genres" },

  // Group by genre and calculate average rating
  {
    $group: {
      _id: "$genres",
      avg_rating: { $avg: "$imdb.rating" },
      movie_count: { $sum: 1 },
      total_votes: { $sum: "$imdb.votes" }
    }
  },

  // Sort by average rating (descending)
  { $sort: { avg_rating: -1 } },

  // Reshape output
  {
    $project: {
      _id: 0,
      genre: "$_id",
      avg_rating: { $round: ["$avg_rating", 2] },
      movie_count: 1,
      total_votes: 1
    }
  },

  // Limit to top 15 for display
  { $limit: 15 }
]).toArray();

ratingsByGenre.forEach(doc => {
  print(`${doc.genre}: ${doc.avg_rating} (${doc.movie_count} movies)`);
});

// ========================================
// 2. Top 10 directors by number of movies
// ========================================
print("\n2. Top 10 directors by number of movies:");
print("-".repeat(50));

const topDirectors = db.movies.aggregate([
  // Unwind directors array
  { $unwind: "$directors" },

  // Group by director
  {
    $group: {
      _id: "$directors",
      movie_count: { $sum: 1 },
      avg_rating: { $avg: "$imdb.rating" },
      best_movie: { $max: "$title" }
    }
  },

  // Sort by movie count (descending)
  { $sort: { movie_count: -1 } },

  // Limit to top 10
  { $limit: 10 },

  // Reshape output
  {
    $project: {
      _id: 0,
      director: "$_id",
      movie_count: 1,
      avg_rating: { $round: ["$avg_rating", 2] }
    }
  }
]).toArray();

topDirectors.forEach(doc => {
  print(`${doc.director}: ${doc.movie_count} movies (avg rating: ${doc.avg_rating})`);
});

// ========================================
// 3. Movies per year with average rating
// ========================================
print("\n3. Movies per year with average rating (recent years):");
print("-".repeat(50));

const moviesByYear = db.movies.aggregate([
  // Filter for movies with year field
  { $match: { year: { $exists: true, $type: "number" } } },

  // Group by year
  {
    $group: {
      _id: "$year",
      movie_count: { $sum: 1 },
      avg_rating: { $avg: "$imdb.rating" },
      top_movie: { $first: "$title" }
    }
  },

  // Filter years with at least 10 movies
  { $match: { movie_count: { $gte: 10 } } },

  // Sort by year (descending)
  { $sort: { _id: -1 } },

  // Limit to recent 20 years
  { $limit: 20 },

  // Reshape output
  {
    $project: {
      _id: 0,
      year: "$_id",
      movie_count: 1,
      avg_rating: { $round: ["$avg_rating", 2] }
    }
  }
]).toArray();

moviesByYear.forEach(doc => {
  print(`${doc.year}: ${doc.movie_count} movies (avg rating: ${doc.avg_rating})`);
});

// ========================================
// 4. Most popular cast members
// ========================================
print("\n4. Top 15 most popular cast members:");
print("-".repeat(50));

const popularCast = db.movies.aggregate([
  // Filter out movies without cast
  { $match: { cast: { $exists: true, $ne: [] } } },

  // Unwind the cast array
  { $unwind: "$cast" },

  // Group by actor
  {
    $group: {
      _id: "$cast",
      appearance_count: { $sum: 1 },
      avg_rating: { $avg: "$imdb.rating" },
      movies: { $push: "$title" }
    }
  },

  // Sort by appearance count (descending)
  { $sort: { appearance_count: -1 } },

  // Limit to top 15
  { $limit: 15 },

  // Reshape output
  {
    $project: {
      _id: 0,
      actor: "$_id",
      appearances: "$appearance_count",
      avg_rating: { $round: ["$avg_rating", 2] },
      sample_movies: { $slice: ["$movies", 3] }
    }
  }
]).toArray();

popularCast.forEach(doc => {
  print(`${doc.actor}: ${doc.appearances} movies (avg rating: ${doc.avg_rating})`);
});

// ========================================
// 5. Revenue analysis by genre (if revenue data exists)
// ========================================
print("\n5. Revenue analysis by genre:");
print("-".repeat(50));

const revenueByGenre = db.movies.aggregate([
  // Check if revenue field exists
  { $match: {
    revenue: { $exists: true, $ne: null, $gt: 0 }
  }},

  // Unwind genres
  { $unwind: "$genres" },

  // Group by genre
  {
    $group: {
      _id: "$genres",
      total_revenue: { $sum: "$revenue" },
      avg_revenue: { $avg: "$revenue" },
      movie_count: { $sum: 1 }
    }
  },

  // Sort by total revenue
  { $sort: { total_revenue: -1 } },

  // Limit to top 10
  { $limit: 10 },

  // Format output
  {
    $project: {
      _id: 0,
      genre: "$_id",
      total_revenue: 1,
      avg_revenue: { $round: ["$avg_revenue", 2] },
      movie_count: 1
    }
  }
]).toArray();

if (revenueByGenre.length > 0) {
  revenueByGenre.forEach(doc => {
    print(`${doc.genre}: $${doc.total_revenue} total (${doc.movie_count} movies)`);
  });
} else {
  print("No revenue data available in the dataset");
}

// ========================================
// 6. User viewing patterns
// ========================================
print("\n6. User viewing patterns:");
print("-".repeat(50));

const userPatterns = db.users.aggregate([
  // Filter users with viewing history
  { $match: {
    viewing_history: { $exists: true, $ne: [] },
    total_movies_watched: { $gt: 0 }
  }},

  // Add favorite genre (first one)
  { $addFields: {
    favorite_genre: { $arrayElemAt: ["$preferences.favorite_genres", 0] }
  }},

  // Group by favorite genre
  {
    $group: {
      _id: "$favorite_genre",
      user_count: { $sum: 1 },
      avg_movies_watched: { $avg: "$total_movies_watched" },
      avg_rating_given: { $avg: "$average_rating_given" }
    }
  },

  // Sort by user count
  { $sort: { user_count: -1 } },

  // Reshape output
  {
    $project: {
      _id: 0,
      favorite_genre: { $ifNull: ["$_id", "Unknown"] },
      user_count: 1,
      avg_movies_watched: { $round: ["$avg_movies_watched", 1] },
      avg_rating_given: { $round: ["$avg_rating_given", 2] }
    }
  }
]).toArray();

userPatterns.forEach(doc => {
  print(`${doc.favorite_genre}: ${doc.user_count} users (avg ${doc.avg_movies_watched} movies watched)`);
});

// ========================================
// 7. Theater utilization
// ========================================
print("\n7. Theater utilization:");
print("-".repeat(50));

const theaterStats = db.theaters.aggregate([
  // Add screening count
  { $addFields: {
    screening_count: {
      $cond: {
        if: { $isArray: "$screenings" },
        then: { $size: "$screenings" },
        else: 0
      }
    }
  }},

  // Group by city
  {
    $group: {
      _id: "$location.city",
      theater_count: { $sum: 1 },
      total_capacity: { $sum: "$capacity" },
      total_screenings: { $sum: "$screening_count" },
      avg_screens: { $avg: "$screens" }
    }
  },

  // Sort by theater count
  { $sort: { theater_count: -1 } },

  // Limit to top cities
  { $limit: 10 },

  // Reshape output
  {
    $project: {
      _id: 0,
      city: "$_id",
      theaters: "$theater_count",
      total_capacity: 1,
      total_screenings: 1,
      avg_screens: { $round: ["$avg_screens", 1] }
    }
  }
]).toArray();

theaterStats.forEach(doc => {
  print(`${doc.city}: ${doc.theaters} theaters, ${doc.total_capacity} total capacity`);
});

// ========================================
// 8. Movies with highest rating variance
// ========================================
print("\n8. Movies with highest rating variance:");
print("-".repeat(50));

const ratingVariance = db.movies.aggregate([
  // Filter movies with both IMDb and tomatoes ratings
  { $match: {
    "imdb.rating": { $exists: true },
    "tomatoes.viewer.rating": { $exists: true }
  }},

  // Calculate rating difference
  { $addFields: {
    rating_diff: {
      $abs: {
        $subtract: ["$imdb.rating", "$tomatoes.viewer.rating"]
      }
    }
  }},

  // Sort by difference
  { $sort: { rating_diff: -1 } },

  // Limit to top 10
  { $limit: 10 },

  // Project relevant fields
  {
    $project: {
      _id: 0,
      title: 1,
      year: 1,
      imdb_rating: "$imdb.rating",
      tomatoes_rating: "$tomatoes.viewer.rating",
      difference: { $round: ["$rating_diff", 2] }
    }
  }
]).toArray();

ratingVariance.forEach(doc => {
  print(`${doc.title} (${doc.year}): IMDb ${doc.imdb_rating} vs Tomatoes ${doc.tomatoes_rating} (diff: ${doc.difference})`);
});

print("\n========================================");
print("Aggregation queries completed!");
print("========================================\n");