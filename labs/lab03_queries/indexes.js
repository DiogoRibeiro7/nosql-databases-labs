// Lab 03 - Index Design and Optimization
// Database: lab03_movies
// Collection: movies, theaters, users

const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "lab03_movies";

async function createIndexes() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    console.log("\n========================================");
    console.log("TASK 3: INDEX DESIGN AND OPTIMIZATION");
    console.log("========================================\n");

    // ========================================
    // BASELINE QUERIES (run these BEFORE creating indexes)
    // ========================================
    console.log("Running baseline queries before indexes...\n");

    // Query 1: Find movies by genre (BEFORE index)
    let explain = await db
      .collection("movies")
      .find({ genres: "Action" })
      .explain("executionStats");
    console.log(
      `Query 1 (genres) - Execution Time: ${explain.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`);

    // Query 2: Find movies by year and rating (BEFORE index)
    explain = await db
      .collection("movies")
      .find({ year: 2015, "imdb.rating": { $gt: 7.0 } })
      .explain("executionStats");
    console.log(
      `Query 2 (year+rating) - Execution Time: ${explain.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`);

    // Query 3: Find movies by director (BEFORE index)
    explain = await db
      .collection("movies")
      .find({ directors: "Christopher Nolan" })
      .explain("executionStats");
    console.log(
      `Query 3 (director) - Execution Time: ${explain.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`);

    // ========================================
    // CREATING INDEXES
    // ========================================
    console.log("\n========================================");
    console.log("CREATING INDEXES");
    console.log("========================================\n");

    // Drop all non-_id indexes first for clean start
    console.log("Dropping existing indexes...");
    await db.collection("movies").dropIndexes();
    await db.collection("theaters").dropIndexes();
    await db.collection("users").dropIndexes();

    // ========================================
    // SINGLE-FIELD INDEXES
    // ========================================
    console.log("\nCreating single-field indexes...");

    // Movies collection
    await db.collection("movies").createIndex({ genres: 1 });
    console.log("  Created: movies.genres");

    await db.collection("movies").createIndex({ year: 1 });
    console.log("  Created: movies.year");

    await db.collection("movies").createIndex({ "imdb.rating": -1 });
    console.log("  Created: movies.imdb.rating");

    await db.collection("movies").createIndex({ directors: 1 });
    console.log("  Created: movies.directors");

    await db.collection("movies").createIndex({ title: 1 });
    console.log("  Created: movies.title");

    await db.collection("movies").createIndex({ cast: 1 });
    console.log("  Created: movies.cast");

    // ========================================
    // COMPOUND INDEXES
    // ========================================
    console.log("\nCreating compound indexes...");

    await db.collection("movies").createIndex({ genres: 1, "imdb.rating": -1 });
    console.log("  Created: movies.(genres, imdb.rating)");

    await db.collection("movies").createIndex({ year: -1, "imdb.rating": -1 });
    console.log("  Created: movies.(year, imdb.rating)");

    await db.collection("movies").createIndex({ directors: 1, year: -1 });
    console.log("  Created: movies.(directors, year)");

    await db.collection("movies").createIndex({ genres: 1, year: -1, "imdb.rating": -1 });
    console.log("  Created: movies.(genres, year, imdb.rating)");

    // ========================================
    // TEXT INDEX
    // ========================================
    console.log("\nCreating text index...");

    await db.collection("movies").createIndex(
      {
        title: "text",
        plot: "text",
      },
      {
        weights: {
          title: 10,
          plot: 5,
        },
        name: "movie_text_index",
      }
    );
    console.log("  Created: movies text index on (title, plot)");

    // ========================================
    // INDEXES ON EMBEDDED FIELDS
    // ========================================
    console.log("\nCreating indexes on embedded fields...");

    await db.collection("movies").createIndex({ "awards.wins": -1 });
    console.log("  Created: movies.awards.wins");

    await db.collection("movies").createIndex({ "awards.nominations": -1 });
    console.log("  Created: movies.awards.nominations");

    await db.collection("movies").createIndex({ "imdb.votes": -1 });
    console.log("  Created: movies.imdb.votes");

    // ========================================
    // INDEXES FOR THEATERS COLLECTION
    // ========================================
    console.log("\nCreating indexes for theaters collection...");

    await db.collection("theaters").createIndex({ "location.city": 1 });
    console.log("  Created: theaters.location.city");

    await db.collection("theaters").createIndex({ "screenings.time": 1 });
    console.log("  Created: theaters.screenings.time");

    await db.collection("theaters").createIndex({ "location.city": 1, "screenings.time": 1 });
    console.log("  Created: theaters.(location.city, screenings.time)");

    await db.collection("theaters").createIndex({ capacity: -1 });
    console.log("  Created: theaters.capacity");

    // ========================================
    // INDEXES FOR USERS COLLECTION
    // ========================================
    console.log("\nCreating indexes for users collection...");

    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    console.log("  Created: users.username (unique)");

    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("  Created: users.email (unique)");

    await db.collection("users").createIndex({ total_movies_watched: -1 });
    console.log("  Created: users.total_movies_watched");

    await db.collection("users").createIndex({ "preferences.favorite_genres": 1 });
    console.log("  Created: users.preferences.favorite_genres");

    await db.collection("users").createIndex({ "viewing_history.movie_id": 1 });
    console.log("  Created: users.viewing_history.movie_id");

    // ========================================
    // SPECIALIZED INDEXES
    // ========================================
    console.log("\nCreating specialized indexes...");

    // Partial index
    await db.collection("movies").createIndex(
      { "imdb.rating": -1 },
      {
        partialFilterExpression: { "imdb.rating": { $gte: 8.0 } },
        name: "high_rated_movies_idx",
      }
    );
    console.log("  Created: Partial index for high-rated movies (>= 8.0)");

    // Sparse index
    await db
      .collection("movies")
      .createIndex({ box_office: -1 }, { sparse: true, name: "box_office_sparse_idx" });
    console.log("  Created: Sparse index on box_office");

    // Covered query index
    await db.collection("movies").createIndex({ title: 1, year: 1, "imdb.rating": 1 });
    console.log("  Created: Covered query index (title, year, imdb.rating)");

    // ========================================
    // POST-INDEX PERFORMANCE TESTING
    // ========================================
    console.log("\n========================================");
    console.log("POST-INDEX PERFORMANCE TESTING");
    console.log("========================================\n");

    // Query 1: Find movies by genre (AFTER index)
    explain = await db.collection("movies").find({ genres: "Action" }).explain("executionStats");
    console.log(
      `Query 1 (genres) - Execution Time: ${explain.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`);
    console.log(`  Index Used: ${explain.executionStats.executionStages.indexName || "None"}`);

    // Query 2: Find movies by year and rating (AFTER index)
    explain = await db
      .collection("movies")
      .find({ year: 2015, "imdb.rating": { $gt: 7.0 } })
      .explain("executionStats");
    console.log(
      `\nQuery 2 (year+rating) - Execution Time: ${explain.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`);
    console.log(`  Index Used: ${explain.executionStats.executionStages.indexName || "None"}`);

    // Query 3: Find movies by director (AFTER index)
    explain = await db
      .collection("movies")
      .find({ directors: "Christopher Nolan" })
      .explain("executionStats");
    console.log(
      `\nQuery 3 (director) - Execution Time: ${explain.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`);
    console.log(`  Index Used: ${explain.executionStats.executionStages.indexName || "None"}`);

    // Query 4: Text search (AFTER index)
    explain = await db
      .collection("movies")
      .find({ $text: { $search: "space adventure" } })
      .explain("executionStats");
    console.log(
      `\nQuery 4 (text search) - Execution Time: ${explain.executionStats.executionTimeMillis}ms`
    );
    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`);

    // ========================================
    // INDEX STATISTICS
    // ========================================
    console.log("\n========================================");
    console.log("INDEX STATISTICS");
    console.log("========================================\n");

    // List all indexes
    const moviesIndexes = await db.collection("movies").indexes();
    console.log(`Movies collection: ${moviesIndexes.length} indexes`);
    moviesIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    const theatersIndexes = await db.collection("theaters").indexes();
    console.log(`\nTheaters collection: ${theatersIndexes.length} indexes`);
    theatersIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    const usersIndexes = await db.collection("users").indexes();
    console.log(`\nUsers collection: ${usersIndexes.length} indexes`);
    usersIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Get collection statistics
    const moviesStats = await db.collection("movies").stats();
    console.log("\nMovies collection statistics:");
    console.log(`  Total documents: ${moviesStats.count}`);
    console.log(`  Collection size: ${(moviesStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Total index size: ${(moviesStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);

    // ========================================
    // EXAMPLE: COVERED VS NON-COVERED QUERY
    // ========================================
    console.log("\n========================================");
    console.log("COVERED VS NON-COVERED QUERY COMPARISON");
    console.log("========================================\n");

    // Non-covered query (needs to read documents)
    explain = await db
      .collection("movies")
      .find(
        { title: "Inception" },
        { projection: { title: 1, year: 1, "imdb.rating": 1, plot: 1, _id: 0 } }
      )
      .explain("executionStats");
    console.log("Non-covered query (includes plot field):");
    console.log(`  Execution Time: ${explain.executionStats.executionTimeMillis}ms`);
    console.log(`  Documents Examined: ${explain.executionStats.totalDocsExamined}`);

    // Covered query (all data from index)
    explain = await db
      .collection("movies")
      .find({ title: "Inception" }, { projection: { title: 1, year: 1, "imdb.rating": 1, _id: 0 } })
      .explain("executionStats");
    console.log("\nCovered query (all fields in index):");
    console.log(`  Execution Time: ${explain.executionStats.executionTimeMillis}ms`);
    console.log(`  Documents Examined: ${explain.executionStats.totalDocsExamined}`);

    console.log("\n========================================");
    console.log("Index creation completed successfully!");
    console.log("========================================");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the index creation
createIndexes().catch(console.error);
