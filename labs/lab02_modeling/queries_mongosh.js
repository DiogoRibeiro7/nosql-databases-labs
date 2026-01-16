/**
 * Lab 02 - E-Commerce Data Model Queries (mongosh version)
 *
 * Run this file in mongosh:
 * mongosh lab02_ecommerce --file queries_mongosh.js
 *
 * Or copy and paste individual queries into mongosh
 */

// Switch to the correct database
use("lab02_ecommerce");

print("=".repeat(60));
print("Lab 02 - Data Model Query Demonstrations");
print("=".repeat(60));

// ========================================================================
// Query 1: Given a Customer, List Their Recent Orders
// ========================================================================
print("\n█".repeat(60));
print("QUERY 1: Customer's Recent Orders");
print("█".repeat(60));

// Simple find query
// Simple find query that relies on embedded items to avoid extra lookups.
const customerOrders = db.orders
  .find({ customer_id: "CUST001" })
  .sort({ order_date: -1 })
  .toArray();

print("\nOrders for Customer CUST001 (Recent First):");
customerOrders.forEach((order, index) => {
  print(`\n${index + 1}. Order ${order.order_id}`);
  print(`   Date: ${order.order_date}`);
  print(`   Status: ${order.status}`);
  print(`   Total: $${order.total}`);
  print(`   Items: ${order.items.length} product(s)`);
  order.items.forEach((item) => {
    print(`     - ${item.product_name} (qty: ${item.quantity})`);
  });
});

// Using aggregation pipeline for more control
print("\n--- Using Aggregation Pipeline ---");
// Aggregation flavor of the same query for summaries/counts.
const customerOrdersAgg = db.orders
  .aggregate([
    { $match: { customer_id: "CUST001" } },
    { $sort: { order_date: -1 } },
    {
      $project: {
        order_id: 1,
        order_date: 1,
        status: 1,
        total: 1,
        item_count: { $size: "$items" },
      },
    },
  ])
  .toArray();

print("Summary:");
customerOrdersAgg.forEach((order) => {
  print(`  ${order.order_id}: ${order.status} - $${order.total} (${order.item_count} items)`);
});

// ========================================================================
// Query 2: Given an Order, Show All Its Items
// ========================================================================
print("\n█".repeat(60));
print("QUERY 2: Order Details with All Items");
print("█".repeat(60));

const orderDetails = db.orders.findOne({ order_id: "ORD001" });

if (orderDetails) {
  print("\nOrder ORD001 Details:");
  print("=".repeat(40));
  print(`Order ID: ${orderDetails.order_id}`);
  print(`Customer: ${orderDetails.customer_id}`);
  print(`Date: ${orderDetails.order_date}`);
  print(`Status: ${orderDetails.status}`);
  print(`Total: $${orderDetails.total}`);
  print("\nItems:");
  orderDetails.items.forEach((item, index) => {
    print(`  ${index + 1}. ${item.product_name}`);
    print(`     Product ID: ${item.product_id}`);
    print(`     Quantity: ${item.quantity}`);
    print(`     Unit Price: $${item.unit_price}`);
    print(`     Subtotal: $${item.subtotal}`);
  });
}

// ========================================================================
// Query 3: List Top N Products by Total Quantity Sold
// ========================================================================
print("\n█".repeat(60));
print("QUERY 3: Top Products by Quantity Sold");
print("█".repeat(60));

const topProducts = db.orders
  .aggregate([
    // Unwind items array to process each item separately.
    { $unwind: "$items" },

    // Group by product and sum quantities
    {
      $group: {
        _id: "$items.product_id",
        product_name: { $first: "$items.product_name" },
        total_quantity_sold: { $sum: "$items.quantity" },
        total_revenue: { $sum: "$items.subtotal" },
        order_count: { $sum: 1 },
      },
    },

    // Sort by total quantity (descending)
    { $sort: { total_quantity_sold: -1 } },

    // Limit to top 5
    { $limit: 5 },

    // Reshape output
    {
      $project: {
        _id: 0,
        product_id: "$_id",
        product_name: 1,
        total_quantity_sold: 1,
        total_revenue: { $round: ["$total_revenue", 2] },
        order_count: 1,
      },
    },
  ])
  .toArray();

print("\nTop 5 Best-Selling Products:");
print("=".repeat(40));
topProducts.forEach((product, index) => {
  print(`\n${index + 1}. ${product.product_name}`);
  print(`   Product ID: ${product.product_id}`);
  print(`   Quantity Sold: ${product.total_quantity_sold} units`);
  print(`   Total Revenue: $${product.total_revenue}`);
  print(`   Orders: ${product.order_count}`);
});

// Alternative: Top Products by Revenue
print("\n--- Top Products by Revenue ---");
// Variant that ranks products by revenue instead of quantity.
const topByRevenue = db.orders
  .aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product_id",
        product_name: { $first: "$items.product_name" },
        total_revenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { total_revenue: -1 } },
    { $limit: 3 },
  ])
  .toArray();

topByRevenue.forEach((product, index) => {
  print(`${index + 1}. ${product.product_name}: $${product.total_revenue.toFixed(2)}`);
});

// ========================================================================
// Query 4: Search/Filter Products by Category
// ========================================================================
print("\n█".repeat(60));
print("QUERY 4: Products by Category");
print("█".repeat(60));

// Simple category filter
print("\nElectronics Products (sorted by rating):");
const electronicsProducts = db.products
  .find({ category: "Electronics" })
  .sort({ "ratings.average": -1 })
  .limit(5)
  .toArray();

electronicsProducts.forEach((product, index) => {
  print(`${index + 1}. ${product.name}`);
  print(`   Price: $${product.price}`);
  print(`   Rating: ${product.ratings.average}/5 (${product.ratings.count} reviews)`);
});

// Category with price range
print("\nAffordable Electronics ($50-$200):");
// Add a price filter to demonstrate range queries on the same data.
const affordableElectronics = db.products
  .find({
    category: "Electronics",
    price: { $gte: 50, $lte: 200 },
  })
  .sort({ price: 1 })
  .toArray();

affordableElectronics.forEach((product, index) => {
  print(`${index + 1}. ${product.name} - $${product.price}`);
});

// Faceted search aggregation
print("\n--- Faceted Search for Electronics ---");
// Run a faceted search to show multiple aggregations over the same match set.
const facetedSearch = db.products
  .aggregate([
    { $match: { category: "Electronics" } },
    {
      $facet: {
        priceRanges: [
          {
            $bucket: {
              groupBy: "$price",
              boundaries: [0, 50, 100, 200, 500, 1000],
              default: "1000+",
              output: { count: { $sum: 1 } },
            },
          },
        ],
        avgPriceBySubcategory: [
          {
            $group: {
              _id: "$subcategory",
              avgPrice: { $avg: "$price" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        topRated: [
          { $sort: { "ratings.average": -1 } },
          { $limit: 3 },
          { $project: { name: 1, price: 1, ratings: 1 } },
        ],
      },
    },
  ])
  .toArray()[0];

print("Price Distribution:");
facetedSearch.priceRanges.forEach((range) => {
  print(`  $${range._id}: ${range.count} products`);
});

print("\nTop Rated Electronics:");
facetedSearch.topRated.forEach((product, index) => {
  print(`  ${index + 1}. ${product.name} - Rating: ${product.ratings.average}/5`);
});

// ========================================================================
// Additional Queries
// ========================================================================
print("\n█".repeat(60));
print("ADDITIONAL ANALYTICS");
print("█".repeat(60));

// Customer spending summary
print("\nCustomer CUST001 Analytics:");
const customerSpending = db.orders
  .aggregate([
    { $match: { customer_id: "CUST001" } },
    {
      $group: {
        _id: "$customer_id",
        total_orders: { $sum: 1 },
        total_spent: { $sum: "$total" },
        average_order_value: { $avg: "$total" },
        first_order: { $min: "$order_date" },
        last_order: { $max: "$order_date" },
      },
    },
  ])
  .toArray()[0];

if (customerSpending) {
  print("=".repeat(40));
  print(`Total Orders: ${customerSpending.total_orders}`);
  print(`Total Spent: $${customerSpending.total_spent.toFixed(2)}`);
  print(`Average Order Value: $${customerSpending.average_order_value.toFixed(2)}`);
  print(`First Order: ${customerSpending.first_order}`);
  print(`Last Order: ${customerSpending.last_order}`);
}

// Products with low stock
print("\nLow Stock Alert (< 20 units):");
const lowStockProducts = db.products
  .find({ stock_quantity: { $lt: 20 } })
  .sort({ stock_quantity: 1 })
  .toArray();

lowStockProducts.forEach((product) => {
  print(`⚠ ${product.name}: ${product.stock_quantity} units remaining`);
});

// Recent reviews for a product
print("\nRecent Reviews for Product PROD001:");
const recentReviews = db.reviews
  .find({ product_id: "PROD001" })
  .sort({ created_at: -1 })
  .limit(3)
  .toArray();

recentReviews.forEach((review, index) => {
  print(`\n${index + 1}. ${review.title} (${review.rating}/5 stars)`);
  print(`   By: ${review.customer_name}`);
  print(`   Date: ${review.created_at}`);
  print(`   "${review.comment}"`);
});

// Update product ratings (example of how to recalculate)
print("\n--- Recalculating Product Ratings ---");
const ratingUpdate = db.reviews
  .aggregate([
    { $match: { product_id: "PROD001" } },
    {
      $group: {
        _id: "$product_id",
        avg_rating: { $avg: "$rating" },
        review_count: { $sum: 1 },
      },
    },
  ])
  .toArray()[0];

if (ratingUpdate) {
  print(`Product PROD001 Rating Update:`);
  print(`  New Average: ${ratingUpdate.avg_rating.toFixed(1)}/5`);
  print(`  Total Reviews: ${ratingUpdate.review_count}`);

  // This would update the product (commented out to avoid modifying data)
  // db.products.updateOne(
  //     { product_id: "PROD001" },
  //     { $set: {
  //         "ratings.average": Math.round(ratingUpdate.avg_rating * 10) / 10,
  //         "ratings.count": ratingUpdate.review_count
  //     }}
  // );
}

// Find all orders containing a specific product
print("\nOrders containing Product PROD001:");
const ordersWithProduct = db.orders
  .find({ "items.product_id": "PROD001" })
  .sort({ order_date: -1 })
  .toArray();

ordersWithProduct.forEach((order) => {
  const item = order.items.find((i) => i.product_id === "PROD001");
  print(`  ${order.order_id} - ${order.order_date} - Qty: ${item.quantity}`);
});

// ========================================================================
// Query Performance Check (using explain)
// ========================================================================
print("\n█".repeat(60));
print("QUERY PERFORMANCE ANALYSIS");
print("█".repeat(60));

// Check if indexes are being used
const explainResult = db.orders
  .explain("executionStats")
  .find({ customer_id: "CUST001" })
  .sort({ order_date: -1 });

print("\nIndex Usage for Customer Orders Query:");
print("=".repeat(40));
if (explainResult.executionStats) {
  print(`Execution Time: ${explainResult.executionStats.executionTimeMillis}ms`);
  print(`Documents Examined: ${explainResult.executionStats.totalDocsExamined}`);
  print(`Documents Returned: ${explainResult.executionStats.nReturned}`);

  const stage = explainResult.executionStats.executionStages;
  if (stage.stage === "COLLSCAN") {
    print(`⚠ Warning: Using COLLSCAN (no index) - Consider adding index on customer_id`);
  } else {
    print(`✓ Using index scan`);
  }
}

// Check collection stats
const stats = db.orders.stats();
print("\nOrders Collection Statistics:");
print(`  Document Count: ${stats.count}`);
print(`  Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
print(`  Average Doc Size: ${stats.avgObjSize} bytes`);
print(`  Indexes: ${stats.nindexes}`);

print("\n" + "=".repeat(60));
print("✓ All queries executed successfully!");
print("=".repeat(60));
/**
 * Lab 02 - Data Modeling
 * Advanced Exercises (mongosh version)
 *
 * Run this file in mongosh:
 *   mongosh --file lab02_advanced_exercises_mongosh.js
 *
 * Or explicitly:
 *   mongosh "mongodb://localhost:27017" --file lab02_advanced_exercises_mongosh.js
 *
 * This script:
 * - Switches to database lab02_advanced using `use()`
 * - Seeds data for each exercise
 * - Runs demonstration queries and prints results
 * - Cleans up by dropping collections at the end
 */

// Switch to the correct database
use("lab02_advanced");

print("=".repeat(60));
print("Lab 02 - Advanced Modeling Exercises (mongosh)");
print("=".repeat(60));

/**
 * Utility: safe drop collection without failing the script.
 * mongosh throws if the collection doesn't exist.
 */
function safeDropCollection(name) {
  try {
    db.getCollection(name).drop();
  } catch {
    // intentionally ignore errors when collection does not exist
  }
}

/**
 * Utility: cleanup all collections created by this script.
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
  collections.forEach(safeDropCollection);

  print("\n" + "=".repeat(60));
  print("✓ Cleanup completed (collections dropped)");
  print("=".repeat(60));
}

// ========================================================================
// EXERCISE 1: One-to-Many Relationships
// ========================================================================
print("\n█".repeat(60));
print("EXERCISE 1: One-to-Many Relationships");
print("█".repeat(60));

// Pattern 1: Embedding (One-to-Few)
print("\nPattern 1: Embedding for One-to-Few (addresses embedded)");
db.users_embedded.deleteMany({});

db.users_embedded.insertOne({
  username: "john_doe",
  email: "john@example.com",
  addresses: [
    { type: "home", street: "123 Main St", city: "Boston", country: "USA", primary: true },
    { type: "work", street: "456 Office Blvd", city: "Cambridge", country: "USA", primary: false },
  ],
});
print("  ✓ Inserted user with embedded addresses");

// Pattern 2: Child References (One-to-Many)
print("\nPattern 2: Child References for One-to-Many (blog post + comments)");
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

db.comments.insertMany([
  { postId: postId, author: "Bob", text: "Great article!", timestamp: new Date() },
  { postId: postId, author: "Charlie", text: "Very helpful, thanks!", timestamp: new Date() },
]);

db.blog_posts.updateOne({ _id: postId }, { $inc: { commentCount: 2 } });
print("  ✓ Inserted post + referenced comments, updated commentCount");

// Pattern 3: Parent References (One-to-Squillions)
print("\nPattern 3: Parent References for One-to-Squillions (server + log entries)");
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
print("  ✓ Inserted server + 100 log entries");

// Queries
print("\n--- Query Examples ---");

// Embedded query: get user + addresses
const userDoc = db.users_embedded.findOne(
  { username: "john_doe" },
  { projection: { addresses: 1 } }
);
if (!userDoc) {
  print("  User john_doe was not found");
} else {
  const addressCount = Array.isArray(userDoc.addresses) ? userDoc.addresses.length : 0;
  print(`  User john_doe has ${addressCount} addresses`);
}

// Child refs: comments for post
const postComments = db.comments.find({ postId: postId }).toArray();
print(`  Post has ${postComments.length} comments`);

// Parent refs: count ERROR logs for server
const errorCount = db.log_entries.countDocuments({ serverId: serverId, level: "ERROR" });
print(`  Server has ${errorCount} ERROR logs`);

// ========================================================================
// EXERCISE 2: Many-to-Many Relationships
// ========================================================================
print("\n█".repeat(60));
print("EXERCISE 2: Many-to-Many Relationships");
print("█".repeat(60));

// Pattern 1: Two-way Embedding
print("\nPattern 1: Two-way Embedding (small datasets)");
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
print("  ✓ Inserted students + course with two-way embedding");

// Pattern 2: Junction Collection
print("\nPattern 2: Junction Collection (large datasets)");
db.actors.deleteMany({});
db.movies.deleteMany({});
db.castings.deleteMany({});

const actorsInsert = db.actors.insertMany([
  { name: "Tom Hanks", birthYear: 1956, country: "USA" },
  { name: "Meryl Streep", birthYear: 1949, country: "USA" },
  { name: "Leonardo DiCaprio", birthYear: 1974, country: "USA" },
]);

const moviesInsert = db.movies.insertMany([
  { title: "Forrest Gump", year: 1994, genre: "Drama" },
  { title: "Cast Away", year: 2000, genre: "Adventure" },
  { title: "The Post", year: 2017, genre: "Drama" },
]);

const actorIds = Object.values(actorsInsert.insertedIds);
const movieIds = Object.values(moviesInsert.insertedIds);

db.castings.insertMany([
  { actorId: actorIds[0], movieId: movieIds[0], role: "Forrest Gump", billing: "Lead" },
  { actorId: actorIds[0], movieId: movieIds[1], role: "Chuck Noland", billing: "Lead" },
  { actorId: actorIds[0], movieId: movieIds[2], role: "Ben Bradlee", billing: "Lead" },
  { actorId: actorIds[1], movieId: movieIds[2], role: "Kay Graham", billing: "Lead" },
]);
print("  ✓ Inserted actors + movies + castings junction collection");

// Query: all movies for Tom Hanks
print("\n--- Querying Many-to-Many ---");
const tom = db.actors.findOne({ name: "Tom Hanks" });

const tomMovies = db.castings
  .aggregate([
    { $match: { actorId: tom._id } },
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

print(`  Tom Hanks movies: ${tomMovies.length}`);
tomMovies.forEach((m) => print(`    - ${m.title} (${m.year}) as ${m.role}`));

// ========================================================================
// EXERCISE 3: Tree Structures
// ========================================================================
print("\n█".repeat(60));
print("EXERCISE 3: Tree Structures");
print("█".repeat(60));

// Pattern 1: Parent References
print("\nPattern 1: Parent References (categories)");
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
print("\nPattern 2: Child References (folders)");
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
print("\nPattern 3: Materialized Paths (employees)");
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

// Pattern 4: Array of Ancestors
print("\nPattern 4: Array of Ancestors (pages)");
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

// ========================================================================
// EXERCISE 4: Polymorphic Collections
// ========================================================================
print("\n█".repeat(60));
print("EXERCISE 4: Polymorphic Collections");
print("█".repeat(60));

db.activity_feed.deleteMany({});

db.activity_feed.insertMany([
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
]);

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

// ========================================================================
// EXERCISE 5: Bucket Pattern
// ========================================================================
print("\n█".repeat(60));
print("EXERCISE 5: Bucket Pattern");
print("█".repeat(60));

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
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

const tempValues = readings.map((r) => r.temperature);
const humValues = readings.map((r) => r.humidity);

const bucket = {
  sensorId: sensorId,
  bucketStart: bucketStart,
  bucketEnd: new Date(bucketStart.getTime() + 3600000),
  measurements: readings,
  count: readings.length,
  stats: {
    temperature: {
      min: Math.min(...tempValues),
      max: Math.max(...tempValues),
      avg: avg(tempValues),
    },
    humidity: { min: Math.min(...humValues), max: Math.max(...humValues), avg: avg(humValues) },
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

// ========================================================================
// EXERCISE 6: Computed Pattern
// ========================================================================
print("\n█".repeat(60));
print("EXERCISE 6: Computed Pattern");
print("█".repeat(60));

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

// Insert reviews + atomic counter updates
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

// Recompute average (read -> compute -> update)
const prod = db.products_computed.findOne({ _id: productId });

const totalRating = Object.entries(prod.ratingSummary.distribution).reduce(
  (sum, [rating, count]) => sum + parseInt(rating, 10) * count,
  0
);
const avgRating = totalRating / prod.ratingSummary.count;

// Cache top reviews
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

// ========================================================================
// DONE + CLEANUP
// ========================================================================
cleanup();

print("\n" + "=".repeat(60));
print("✓ All advanced exercises executed successfully!");
print("=".repeat(60));
