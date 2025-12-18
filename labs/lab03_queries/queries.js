// Lab 03 - Complex Queries
// Database: lab03_movies
// Collection: movies, theaters, users

const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "lab03_movies";

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    console.log("\n========================================");
    console.log("TASK 1: COMPLEX QUERIES");
    console.log("========================================\n");

    // ========================================
    // 1. Find all movies released between 2010 and 2020 with IMDb rating > 8.0
    // ========================================
    console.log("1. Movies between 2010-2020 with IMDb rating > 8.0:");
    console.log("-".repeat(50));

    const highRatedMovies = await db
      .collection("movies")
      .find({
        year: { $gte: 2010, $lte: 2020 },
        "imdb.rating": { $gt: 8.0 },
      })
      .project({
        title: 1,
        year: 1,
        "imdb.rating": 1,
        genres: 1,
        _id: 0,
      })
      .sort({ "imdb.rating": -1 })
      .limit(10)
      .toArray();

    highRatedMovies.forEach((movie) => {
      console.log(`  ${movie.year}: ${movie.title} - Rating: ${movie["imdb.rating"]}`);
    });

    // ========================================
    // 2. Find all movies in "Drama" or "Thriller" genres with at least one award
    // ========================================
    console.log("\n2. Drama/Thriller movies with awards:");
    console.log("-".repeat(50));

    const awardedMovies = await db
      .collection("movies")
      .find({
        genres: { $in: ["Drama", "Thriller"] },
        "awards.wins": { $gte: 1 },
      })
      .project({
        title: 1,
        genres: 1,
        "awards.wins": 1,
        _id: 0,
      })
      .sort({ "awards.wins": -1 })
      .limit(10)
      .toArray();

    awardedMovies.forEach((movie) => {
      console.log(`  ${movie.title}: ${movie.awards.wins} wins`);
    });

    // ========================================
    // 3. Find all movies where Tom Hanks appears in the cast
    // ========================================
    console.log("\n3. Tom Hanks movies:");
    console.log("-".repeat(50));

    const tomHanksMovies = await db
      .collection("movies")
      .find({
        cast: "Tom Hanks",
      })
      .project({
        title: 1,
        year: 1,
        "imdb.rating": 1,
        _id: 0,
      })
      .sort({ year: -1 })
      .limit(10)
      .toArray();

    tomHanksMovies.forEach((movie) => {
      console.log(`  ${movie.year}: ${movie.title} - Rating: ${movie["imdb.rating"]}`);
    });

    // ========================================
    // 4. Find movies released in last 5 years, sorted by rating, top 20
    // ========================================
    console.log("\n4. Recent movies (last 5 years) - Top 20:");
    console.log("-".repeat(50));

    const currentYear = new Date().getFullYear();
    const fiveYearsAgo = currentYear - 5;

    const recentMovies = await db
      .collection("movies")
      .find({
        year: { $gte: fiveYearsAgo },
      })
      .project({
        title: 1,
        year: 1,
        "imdb.rating": 1,
        genres: 1,
        _id: 0,
      })
      .sort({ "imdb.rating": -1 })
      .limit(20)
      .toArray();

    console.log(`  Found ${recentMovies.length} recent movies (showing top 5):`);
    recentMovies.slice(0, 5).forEach((movie) => {
      console.log(`  ${movie.year}: ${movie.title} - Rating: ${movie["imdb.rating"]}`);
    });

    // ========================================
    // 5. Find all theaters in New York
    // ========================================
    console.log("\n5. Theaters in New York:");
    console.log("-".repeat(50));

    const nyTheaters = await db
      .collection("theaters")
      .find({
        "location.city": "New York",
      })
      .project({
        name: 1,
        "location.city": 1,
        capacity: 1,
        _id: 0,
      })
      .limit(10)
      .toArray();

    console.log(`  Found ${nyTheaters.length} theaters in New York`);
    nyTheaters.forEach((theater) => {
      console.log(`  ${theater.name}: Capacity ${theater.capacity || "N/A"}`);
    });

    // ========================================
    // 6. Find users who watched >50 movies and prefer "Sci-Fi"
    // ========================================
    console.log("\n6. Active Sci-Fi fans (>50 movies watched):");
    console.log("-".repeat(50));

    const sciFiFans = await db
      .collection("users")
      .find({
        total_movies_watched: { $gt: 50 },
        "preferences.favorite_genres": "Sci-Fi",
      })
      .project({
        username: 1,
        total_movies_watched: 1,
        "preferences.favorite_genres": 1,
        _id: 0,
      })
      .limit(10)
      .toArray();

    console.log(`  Found ${sciFiFans.length} active Sci-Fi fans`);
    sciFiFans.forEach((user) => {
      console.log(`  ${user.username}: ${user.total_movies_watched} movies watched`);
    });

    // ========================================
    // 7. Find movies with runtime between 90-120 minutes, excluding documentaries
    // ========================================
    console.log("\n7. Movies 90-120 minutes (excluding documentaries):");
    console.log("-".repeat(50));

    const standardMovies = await db
      .collection("movies")
      .find({
        runtime: { $gte: 90, $lte: 120 },
        genres: { $ne: "Documentary" },
      })
      .project({
        title: 1,
        runtime: 1,
        genres: 1,
        "imdb.rating": 1,
        _id: 0,
      })
      .sort({ "imdb.rating": -1 })
      .limit(10)
      .toArray();

    standardMovies.forEach((movie) => {
      console.log(`  ${movie.title}: ${movie.runtime} min - Rating: ${movie["imdb.rating"]}`);
    });

    // ========================================
    // 8. Text search: Find movies with "space" or "alien" in title or plot
    // ========================================
    console.log('\n8. Text search for "space alien":');
    console.log("-".repeat(50));

    try {
      const searchResults = await db
        .collection("movies")
        .find({
          $text: { $search: "space alien" },
        })
        .project({
          score: { $meta: "textScore" },
          title: 1,
          year: 1,
          _id: 0,
        })
        .sort({ score: { $meta: "textScore" } })
        .limit(10)
        .toArray();

      console.log(`  Found ${searchResults.length} movies`);
      searchResults.forEach((movie) => {
        console.log(`  ${movie.title} (${movie.year}) - Score: ${movie.score.toFixed(2)}`);
      });
    } catch (error) {
      console.log(
        '  Text index not available. Create it with: db.movies.createIndex({title:"text", plot:"text"})'
      );
      console.log(`  Details: ${error.message}`);
    }

    // ========================================
    // 9. Find movies by Christopher Nolan with high ratings
    // ========================================
    console.log("\n9. Christopher Nolan movies (rating >= 8.0):");
    console.log("-".repeat(50));

    const nolanMovies = await db
      .collection("movies")
      .find({
        directors: "Christopher Nolan",
        "imdb.rating": { $gte: 8.0 },
      })
      .project({
        title: 1,
        year: 1,
        "imdb.rating": 1,
        _id: 0,
      })
      .sort({ year: -1 })
      .toArray();

    nolanMovies.forEach((movie) => {
      console.log(`  ${movie.year}: ${movie.title} - Rating: ${movie["imdb.rating"]}`);
    });

    // ========================================
    // 10. Find highly-rated but not highly-awarded movies
    // ========================================
    console.log("\n10. Hidden gems (high rating, few awards):");
    console.log("-".repeat(50));

    const hiddenGems = await db
      .collection("movies")
      .find({
        "imdb.rating": { $gte: 8.5 },
        "awards.wins": { $lt: 50 },
      })
      .project({
        title: 1,
        year: 1,
        "imdb.rating": 1,
        "awards.wins": 1,
        _id: 0,
      })
      .sort({ "imdb.rating": -1 })
      .limit(10)
      .toArray();

    hiddenGems.forEach((movie) => {
      console.log(
        `  ${movie.title}: Rating ${movie["imdb.rating"]}, ${movie.awards.wins || 0} awards`
      );
    });

    // ========================================
    // PERFORMANCE ANALYSIS WITH EXPLAIN
    // ========================================
    console.log("\n========================================");
    console.log("QUERY PERFORMANCE ANALYSIS");
    console.log("========================================\n");

    // Check execution plan for genre query
    const explainGenre = await db
      .collection("movies")
      .find({ genres: "Action" })
      .explain("executionStats");
    console.log(`Genre query execution time: ${explainGenre.executionStats.executionTimeMillis}ms`);
    console.log(`  Documents examined: ${explainGenre.executionStats.totalDocsExamined}`);
    console.log(
      `  Index used: ${explainGenre.executionStats.executionStages.indexName || "None (COLLSCAN)"}`
    );

    // Check execution plan for year + rating query
    const explainCompound = await db
      .collection("movies")
      .find({ year: 2015, "imdb.rating": { $gt: 7.0 } })
      .explain("executionStats");
    console.log(
      `\nCompound query execution time: ${explainCompound.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Documents examined: ${explainCompound.executionStats.totalDocsExamined}`);
    console.log(
      `  Index used: ${explainCompound.executionStats.executionStages.indexName || "None (COLLSCAN)"}`
    );

    // ========================================
    // AGGREGATION COUNTS
    // ========================================
    console.log("\n========================================");
    console.log("COLLECTION STATISTICS");
    console.log("========================================\n");

    const movieCount = await db.collection("movies").countDocuments();
    const theaterCount = await db.collection("theaters").countDocuments();
    const userCount = await db.collection("users").countDocuments();

    console.log(`Total movies: ${movieCount}`);
    console.log(`Total theaters: ${theaterCount}`);
    console.log(`Total users: ${userCount}`);

    // Get distinct genres
    const genres = await db.collection("movies").distinct("genres");
    console.log(`\nUnique genres: ${genres.length}`);
    console.log(`  Sample: ${genres.slice(0, 10).join(", ")}`);

    // Get distinct directors
    const directors = await db.collection("movies").distinct("directors");
    console.log(`\nUnique directors: ${directors.length}`);

    console.log("\n========================================");
    console.log("Queries completed successfully!");
    console.log("========================================");
  } catch (error) {
    console.error("Error running queries:", error);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the queries
runQueries().catch(console.error);
