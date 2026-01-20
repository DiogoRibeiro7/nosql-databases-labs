/**
 * Lab 02 - Data Modeling (mongosh version)
 * Advanced Exercises
 *
 * Advanced MongoDB data modeling patterns and best practices
 *
 * Run this file in mongosh:
 *   mongosh lab02_advanced --file advanced_exercises_mongosh.js
 *
 * Or explicitly:
 *   mongosh "mongodb://localhost:27017/lab02_advanced" --file advanced_exercises_mongosh.js
 *
 * Notes:
 * - This is a pure mongosh script (no MongoClient, no require(), no module.exports).
 * - Uses `use()` to select the DB and the global `db` handle for operations.
 */

// Switch to the correct database
use("lab02_advanced");

print("=".repeat(60));
print("Lab 02 - Advanced Modeling Exercises (mongosh)");
print("=".repeat(60));

/**
 * Helper: print a section banner.
 * @param {string} title
 */
function banner(title) {
  print("\n█".repeat(60));
  print(title);
  print("█".repeat(60));
}

/**
 * Helper: safe drop collection without failing if it does not exist.
 * @param {string} name
 */
function safeDrop(name) {
  try {
    db.getCollection(name).drop();
  } catch {
    // intentionally ignore missing collections
  }
}

/**
 * Exercise 1: One-to-Many Relationships
 * Embedding vs Referencing decision making.
 */
function oneToManyRelationships() {
  banner("EXERCISE 1: One-to-Many Relationships");

  // ----------------------------------------------------------------------
  // Pattern 1: Embedding (One-to-Few)
  // ----------------------------------------------------------------------
  print("\nPattern 1: Embedding for One-to-Few");
  db.users_embedded.deleteMany({});

  const userWithAddresses = {
    username: "john_doe",
    email: "john@example.com",
    // Embed few addresses (typically < 100)
    addresses: [
      { type: "home", street: "123 Main St", city: "Boston", country: "USA", primary: true },
      {
        type: "work",
        street: "456 Office Blvd",
        city: "Cambridge",
        country: "USA",
        primary: false,
      },
    ],
  };

  db.users_embedded.insertOne(userWithAddresses);
  print("  ✓ Embedded addresses in user document");

  // ----------------------------------------------------------------------
  // Pattern 2: Child References (One-to-Many)
  // ----------------------------------------------------------------------
  print("\nPattern 2: Child References for One-to-Many");
  db.blog_posts.deleteMany({});
  db.comments.deleteMany({});

  const postInsert = db.blog_posts.insertOne({
    title: "Introduction to MongoDB",
    content: "MongoDB is a document database...",
    author: "Alice",
    tags: ["mongodb", "nosql", "database"],
    commentCount: 0,
  });
  const postId = postInsert.insertedId;

  const commentData = [
    { postId: postId, author: "Bob", text: "Great article!", timestamp: new Date() },
    { postId: postId, author: "Charlie", text: "Very helpful, thanks!", timestamp: new Date() },
  ];

  db.comments.insertMany(commentData);
  db.blog_posts.updateOne({ _id: postId }, { $inc: { commentCount: 2 } });
  print("  ✓ Stored comment references separately");

  // ----------------------------------------------------------------------
  // Pattern 3: Parent References (One-to-Squillions)
  // ----------------------------------------------------------------------
  print("\nPattern 3: Parent References for One-to-Squillions");
  db.servers.deleteMany({});
  db.log_entries.deleteMany({});

  const serverInsert = db.servers.insertOne({
    hostname: "web-server-01",
    ip: "192.168.1.100",
    status: "active",
    lastChecked: new Date(),
  });
  const serverId = serverInsert.insertedId;

  const levels = ["INFO", "WARN", "ERROR"];
  const nowMs = Date.now();

  const logs = Array.from({ length: 100 }, (_, i) => ({
    serverId: serverId,
    level: levels[Math.floor(Math.random() * levels.length)],
    message: `Log entry ${i}`,
    timestamp: new Date(nowMs - i * 1000),
  }));

  db.log_entries.insertMany(logs);
  print("  ✓ Stored parent references in log entries");

  // ----------------------------------------------------------------------
  // Query demonstrations
  // ----------------------------------------------------------------------
  print("\nQuery Examples:");

  // Embedded query
  const userAddresses = db.users_embedded.findOne(
    { username: "john_doe" },
    { projection: { addresses: 1 } }
  );
  print(`  User has ${userAddresses.addresses.length} addresses`);

  // Child reference query
  const postComments = db.comments.find({ postId: postId }).toArray();
  print(`  Post has ${postComments.length} comments`);

  // Parent reference query
  const errorCount = db.log_entries.countDocuments({ serverId: serverId, level: "ERROR" });
  print(`  Server has ${errorCount} error logs`);
}

/**
 * Exercise 2: Many-to-Many Relationships
 * Different patterns for M:N relationships.
 */
function manyToManyRelationships() {
  banner("EXERCISE 2: Many-to-Many Relationships");

  // ----------------------------------------------------------------------
  // Pattern 1: Two-way Embedding (small datasets)
  // ----------------------------------------------------------------------
  print("\nPattern 1: Two-way Embedding (Small datasets)");
  db.students_embed.deleteMany({});
  db.courses_embed.deleteMany({});

  db.students_embed.insertMany([
    {
      name: "Alice",
      email: "alice@university.edu",
      enrolledCourses: [
        { courseId: "CS101", name: "Intro to CS", grade: "A" },
        { courseId: "MATH201", name: "Calculus II", grade: "B+" },
      ],
    },
    {
      name: "Bob",
      email: "bob@university.edu",
      enrolledCourses: [
        { courseId: "CS101", name: "Intro to CS", grade: "B" },
        { courseId: "PHY101", name: "Physics I", grade: "A-" },
      ],
    },
  ]);

  db.courses_embed.insertOne({
    courseId: "CS101",
    name: "Introduction to Computer Science",
    instructor: "Dr. Smith",
    enrolledStudents: [
      { name: "Alice", email: "alice@university.edu" },
      { name: "Bob", email: "bob@university.edu" },
    ],
    capacity: 30,
    enrolled: 2,
  });
  print("  ✓ Two-way embedding completed");

  // ----------------------------------------------------------------------
  // Pattern 2: Junction Collection (large datasets)
  // ----------------------------------------------------------------------
  print("\nPattern 2: Junction Collection (Large datasets)");
  db.actors.deleteMany({});
  db.movies.deleteMany({});
  db.castings.deleteMany({});

  const actorResults = db.actors.insertMany([
    { name: "Tom Hanks", birthYear: 1956, country: "USA" },
    { name: "Meryl Streep", birthYear: 1949, country: "USA" },
    { name: "Leonardo DiCaprio", birthYear: 1974, country: "USA" },
  ]);

  const movieResults = db.movies.insertMany([
    { title: "Forrest Gump", year: 1994, genre: "Drama" },
    { title: "Cast Away", year: 2000, genre: "Adventure" },
    { title: "The Post", year: 2017, genre: "Drama" },
  ]);

  const actorIds = Object.values(actorResults.insertedIds);
  const movieIds = Object.values(movieResults.insertedIds);

  db.castings.insertMany([
    { actorId: actorIds[0], movieId: movieIds[0], role: "Forrest Gump", billing: "Lead" },
    { actorId: actorIds[0], movieId: movieIds[1], role: "Chuck Noland", billing: "Lead" },
    { actorId: actorIds[0], movieId: movieIds[2], role: "Ben Bradlee", billing: "Lead" },
    { actorId: actorIds[1], movieId: movieIds[2], role: "Kay Graham", billing: "Lead" },
  ]);
  print("  ✓ Junction collection created");

  // Query M:N relationships
  print("\nQuerying Many-to-Many:");

  const tomHanks = db.actors.findOne({ name: "Tom Hanks" });

  const tomHanksMovies = db.castings
    .aggregate([
      { $match: { actorId: tomHanks._id } },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      { $project: { _id: 0, title: "$movie.title", year: "$movie.year", role: 1 } },
      { $sort: { year: 1 } },
    ])
    .toArray();

  print(`  Tom Hanks movies: ${tomHanksMovies.length}`);
  tomHanksMovies.forEach((m) => print(`    - ${m.title} (${m.year}) as ${m.role}`));
}

/**
 * Exercise 3: Tree Structures
 * Hierarchical data modeling patterns.
 */
function treeStructures() {
  banner("EXERCISE 3: Tree Structures");

  // Pattern 1: Parent References
  print("\nPattern 1: Parent References");
  db.categories_parent.deleteMany({});

  db.categories_parent.insertMany([
    { _id: "Electronics", parent: null },
    { _id: "Computers", parent: "Electronics" },
    { _id: "Laptops", parent: "Computers" },
    { _id: "Desktops", parent: "Computers" },
    { _id: "Phones", parent: "Electronics" },
    { _id: "Smartphones", parent: "Phones" },
    { _id: "Feature Phones", parent: "Phones" },
  ]);

  const computerChildren = db.categories_parent.find({ parent: "Computers" }).toArray();
  print("  Children of Computers: " + computerChildren.map((c) => c._id).join(", "));

  // Pattern 2: Child References
  print("\nPattern 2: Child References");
  db.folders_children.deleteMany({});

  db.folders_children.insertMany([
    { _id: "root", name: "Root", children: ["documents", "pictures"] },
    { _id: "documents", name: "Documents", children: ["work", "personal"] },
    { _id: "work", name: "Work", children: [] },
    { _id: "personal", name: "Personal", children: [] },
    { _id: "pictures", name: "Pictures", children: ["vacation", "family"] },
    { _id: "vacation", name: "Vacation", children: [] },
    { _id: "family", name: "Family", children: [] },
  ]);

  const rootFolder = db.folders_children.findOne({ _id: "root" });
  print(`  Root folder children: ${rootFolder.children.join(", ")}`);

  // Pattern 3: Materialized Paths
  print("\nPattern 3: Materialized Paths");
  db.employees_path.deleteMany({});

  db.employees_path.insertMany([
    { name: "CEO", path: "," },
    { name: "CTO", path: ",CEO," },
    { name: "CFO", path: ",CEO," },
    { name: "VP Engineering", path: ",CEO,CTO," },
    { name: "VP Sales", path: ",CEO," },
    { name: "Engineer 1", path: ",CEO,CTO,VP Engineering," },
    { name: "Engineer 2", path: ",CEO,CTO,VP Engineering," },
  ]);

  const ctoDescendants = db.employees_path.find({ path: { $regex: ",CTO," } }).toArray();
  print("  CTO descendants: " + ctoDescendants.map((e) => e.name).join(", "));

  // Pattern 4: Array of Ancestors (the original code labeled this "Nested Sets"
  // but the structure used is "Array of Ancestors")
  print("\nPattern 4: Array of Ancestors");
  db.pages_ancestors.deleteMany({});

  db.pages_ancestors.insertMany([
    { name: "Home", ancestors: [] },
    { name: "Products", ancestors: ["Home"] },
    { name: "Laptops", ancestors: ["Home", "Products"] },
    { name: "Gaming Laptops", ancestors: ["Home", "Products", "Laptops"] },
    { name: "Services", ancestors: ["Home"] },
    { name: "Support", ancestors: ["Home", "Services"] },
  ]);

  const underProducts = db.pages_ancestors.find({ ancestors: "Products" }).toArray();
  print("  Pages under Products: " + underProducts.map((p) => p.name).join(", "));
}

/**
 * Exercise 4: Polymorphic Collections
 * Single collection for multiple entity types.
 */
function polymorphicCollections() {
  banner("EXERCISE 4: Polymorphic Collections");

  db.activity_feed.deleteMany({});

  const activityData = [
    {
      type: "post",
      userId: "user123",
      timestamp: new Date(),
      data: { title: "My First Post", content: "Hello World!", tags: ["introduction", "hello"] },
    },
    {
      type: "comment",
      userId: "user456",
      timestamp: new Date(),
      data: { postId: "post123", text: "Great post!", parentCommentId: null },
    },
    {
      type: "like",
      userId: "user789",
      timestamp: new Date(),
      data: { targetType: "post", targetId: "post123" },
    },
    {
      type: "share",
      userId: "user123",
      timestamp: new Date(),
      data: { originalPostId: "post456", message: "Check this out!" },
    },
    {
      type: "follow",
      userId: "user456",
      timestamp: new Date(),
      data: { followedUserId: "user123" },
    },
  ];

  db.activity_feed.insertMany(activityData);
  print("Inserted polymorphic activity documents");

  print("\nActivity counts by type:");
  const typeCounts = db.activity_feed
    .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    .toArray();
  typeCounts.forEach((tc) => print(`  ${tc._id}: ${tc.count}`));

  print("\nType-specific queries:");
  const posts = db.activity_feed.find({ type: "post" }).toArray();
  print(`  Posts: ${posts.length}`);

  const postLikes = db.activity_feed.countDocuments({
    type: "like",
    "data.targetType": "post",
    "data.targetId": "post123",
  });
  print(`  Likes for post123: ${postLikes}`);
}

/**
 * Exercise 5: Bucket Pattern
 * Optimize for time-series and IoT data.
 */
function bucketPattern() {
  banner("EXERCISE 5: Bucket Pattern");

  db.sensor_buckets.deleteMany({});

  const bucketStart = new Date("2024-01-15T10:00:00Z");
  const sensorId = "sensor-001";

  const readings = [];
  for (let i = 0; i < 60; i++) {
    readings.push({
      timestamp: new Date(bucketStart.getTime() + i * 60000),
      temperature: 20 + Math.random() * 5,
      humidity: 60 + Math.random() * 10,
      pressure: 1013 + Math.random() * 10,
    });
  }

  function avg(xs) {
    return xs.reduce((sum, x) => sum + x, 0) / xs.length;
  }

  const temps = readings.map((r) => r.temperature);
  const hums = readings.map((r) => r.humidity);

  const bucket = {
    sensorId: sensorId,
    bucketStart: bucketStart,
    bucketEnd: new Date(bucketStart.getTime() + 3600000),
    measurements: readings,
    count: readings.length,
    stats: {
      temperature: { min: Math.min(...temps), max: Math.max(...temps), avg: avg(temps) },
      humidity: { min: Math.min(...hums), max: Math.max(...hums), avg: avg(hums) },
    },
  };

  db.sensor_buckets.insertOne(bucket);

  print("Created sensor data bucket:");
  print(`  Sensor: ${bucket.sensorId}`);
  print(`  Period: ${bucket.bucketStart.toISOString()} to ${bucket.bucketEnd.toISOString()}`);
  print(`  Measurements: ${bucket.count}`);
  print(
    `  Temp range: ${bucket.stats.temperature.min.toFixed(1)}°C - ${bucket.stats.temperature.max.toFixed(1)}°C`
  );

  const queryTime = new Date("2024-01-15T10:30:00Z");
  const bucketWithTime = db.sensor_buckets.findOne({
    sensorId: sensorId,
    bucketStart: { $lte: queryTime },
    bucketEnd: { $gt: queryTime },
  });

  if (bucketWithTime) {
    const reading = bucketWithTime.measurements.find(
      (m) => m.timestamp.getTime() === queryTime.getTime()
    );
    print(`\nReading at ${queryTime.toISOString()}:`);
    if (reading) print(`  Temperature: ${reading.temperature.toFixed(1)}°C`);
    else print("  (No exact reading at that timestamp)");
  }
}

/**
 * Exercise 6: Computed Pattern
 * Pre-compute and store expensive calculations.
 */
function computedPattern() {
  banner("EXERCISE 6: Computed Pattern");

  db.products_computed.deleteMany({});
  db.reviews.deleteMany({});

  const prodInsert = db.products_computed.insertOne({
    name: "Wireless Headphones",
    price: 99.99,
    category: "Electronics",
    ratingSummary: {
      average: 0,
      count: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      lastUpdated: new Date(),
    },
    popularReviews: [],
  });
  const productId = prodInsert.insertedId;

  const reviewData = [
    { rating: 5, text: "Excellent sound quality!", helpful: 45 },
    { rating: 4, text: "Good value for money", helpful: 32 },
    { rating: 5, text: "Love these headphones", helpful: 28 },
    { rating: 3, text: "Average battery life", helpful: 15 },
    { rating: 5, text: "Best purchase ever!", helpful: 52 },
  ];

  // Insert reviews and update computed fields atomically (count + distribution)
  reviewData.forEach((r) => {
    db.reviews.insertOne({
      productId: productId,
      rating: r.rating,
      text: r.text,
      helpful: r.helpful,
      timestamp: new Date(),
    });

    db.products_computed.updateOne(
      { _id: productId },
      {
        $inc: {
          "ratingSummary.count": 1,
          [`ratingSummary.distribution.${r.rating}`]: 1,
        },
        $set: { "ratingSummary.lastUpdated": new Date() },
      }
    );
  });

  // Recalculate average (read -> compute -> update)
  const product = db.products_computed.findOne({ _id: productId });

  const totalRating = Object.entries(product.ratingSummary.distribution).reduce(
    (sum, [rating, count]) => sum + parseInt(rating, 10) * count,
    0
  );
  const avgRating = totalRating / product.ratingSummary.count;

  // Cache top reviews by helpful votes
  const topReviews = db.reviews
    .find({ productId: productId })
    .sort({ helpful: -1 })
    .limit(3)
    .toArray();

  db.products_computed.updateOne(
    { _id: productId },
    {
      $set: {
        "ratingSummary.average": parseFloat(avgRating.toFixed(2)),
        popularReviews: topReviews.map((t) => ({
          rating: t.rating,
          text: t.text,
          helpful: t.helpful,
        })),
      },
    }
  );

  const finalProduct = db.products_computed.findOne({ _id: productId });

  print("Product with computed fields:");
  print(`  Name: ${finalProduct.name}`);
  print(
    `  Average Rating: ${finalProduct.ratingSummary.average} (${finalProduct.ratingSummary.count} reviews)`
  );
  print("  Rating Distribution:");
  Object.entries(finalProduct.ratingSummary.distribution)
    .reverse()
    .forEach(([rating, count]) => print(`    ${rating} stars: ${count}`));
  print(`  Top Reviews Cached: ${finalProduct.popularReviews.length}`);
}

/**
 * Cleanup: drop all collections created by this script.
 */
function cleanup() {
  const collections = [
    "users_embedded",
    "blog_posts",
    "comments",
    "servers",
    "log_entries",
    "students_embed",
    "courses_embed",
    "actors",
    "movies",
    "castings",
    "categories_parent",
    "folders_children",
    "employees_path",
    "pages_ancestors",
    "activity_feed",
    "sensor_buckets",
    "products_computed",
    "reviews",
  ];

  collections.forEach(safeDrop);
  print("\nCleanup completed");
}

// ========================================================================
// Main execution (mongosh style)
// ========================================================================
print("\n=== Lab 02 Advanced Modeling Exercises ===");
print("==========================================");

try {
  oneToManyRelationships();
  manyToManyRelationships();
  treeStructures();
  polymorphicCollections();
  bucketPattern();
  computedPattern();
} catch (e) {
  print("Error: " + (e && e.stack ? e.stack : e));
} finally {
  cleanup();
}

print("\n" + "=".repeat(60));
print("✓ All advanced exercises executed successfully!");
print("=".repeat(60));
