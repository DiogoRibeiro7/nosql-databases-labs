/**
 * Lab 02 - Data Modeling
 * Advanced Exercises
 *
 * Advanced MongoDB data modeling patterns and best practices
 */

const { MongoClient } = require('mongodb');

class Lab02AdvancedExercises {
  constructor(connectionUrl) {
    this.connectionUrl = connectionUrl || 'mongodb://localhost:27017';
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionUrl);
    await this.client.connect();
    this.db = this.client.db('lab02_advanced');
    console.log('Connected to MongoDB - Lab 02 Advanced');
  }

  /**
   * Exercise 1: One-to-Many Relationships
   * Embedding vs Referencing Decision Making
   */
  async oneToManyRelationships() {
    console.log('\n=== Exercise 1: One-to-Many Relationships ===\n');

    // Pattern 1: Embedding (One-to-Few)
    console.log('Pattern 1: Embedding for One-to-Few');
    const users = this.db.collection('users_embedded');
    await users.deleteMany({});

    const userWithAddresses = {
      username: 'john_doe',
      email: 'john@example.com',
      // Embed few addresses (typically < 100)
      addresses: [
        {
          type: 'home',
          street: '123 Main St',
          city: 'Boston',
          country: 'USA',
          primary: true
        },
        {
          type: 'work',
          street: '456 Office Blvd',
          city: 'Cambridge',
          country: 'USA',
          primary: false
        }
      ]
    };

    await users.insertOne(userWithAddresses);
    console.log('  ✓ Embedded addresses in user document');

    // Pattern 2: Child References (One-to-Many)
    console.log('\nPattern 2: Child References for One-to-Many');
    const blogPosts = this.db.collection('blog_posts');
    const comments = this.db.collection('comments');
    await blogPosts.deleteMany({});
    await comments.deleteMany({});

    const postResult = await blogPosts.insertOne({
      title: 'Introduction to MongoDB',
      content: 'MongoDB is a document database...',
      author: 'Alice',
      tags: ['mongodb', 'nosql', 'database'],
      commentCount: 0
    });

    // Store references in child documents
    const commentData = [
      {
        postId: postResult.insertedId,
        author: 'Bob',
        text: 'Great article!',
        timestamp: new Date()
      },
      {
        postId: postResult.insertedId,
        author: 'Charlie',
        text: 'Very helpful, thanks!',
        timestamp: new Date()
      }
    ];

    await comments.insertMany(commentData);
    await blogPosts.updateOne(
      { _id: postResult.insertedId },
      { $inc: { commentCount: 2 } }
    );
    console.log('  ✓ Stored comment references separately');

    // Pattern 3: Parent References (One-to-Squillions)
    console.log('\nPattern 3: Parent References for One-to-Squillions');
    const servers = this.db.collection('servers');
    const logEntries = this.db.collection('log_entries');
    await servers.deleteMany({});
    await logEntries.deleteMany({});

    const serverResult = await servers.insertOne({
      hostname: 'web-server-01',
      ip: '192.168.1.100',
      status: 'active',
      lastChecked: new Date()
    });

    // Store parent reference in massive collection
    const logs = Array.from({ length: 100 }, (_, i) => ({
      serverId: serverResult.insertedId,
      level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)],
      message: `Log entry ${i}`,
      timestamp: new Date(Date.now() - i * 1000)
    }));

    await logEntries.insertMany(logs);
    console.log('  ✓ Stored parent references in log entries');

    // Query demonstrations
    console.log('\nQuery Examples:');

    // Embedded query
    const userAddresses = await users.findOne(
      { username: 'john_doe' },
      { projection: { addresses: 1 } }
    );
    console.log(`  User has ${userAddresses.addresses.length} addresses`);

    // Child reference query
    const postComments = await comments.find({ postId: postResult.insertedId }).toArray();
    console.log(`  Post has ${postComments.length} comments`);

    // Parent reference query with aggregation
    const errorCount = await logEntries.countDocuments({
      serverId: serverResult.insertedId,
      level: 'ERROR'
    });
    console.log(`  Server has ${errorCount} error logs`);
  }

  /**
   * Exercise 2: Many-to-Many Relationships
   * Different patterns for M:N relationships
   */
  async manyToManyRelationships() {
    console.log('\n=== Exercise 2: Many-to-Many Relationships ===\n');

    // Pattern 1: Two-way Embedding
    console.log('Pattern 1: Two-way Embedding (Small datasets)');
    const students = this.db.collection('students_embed');
    const courses = this.db.collection('courses_embed');
    await students.deleteMany({});
    await courses.deleteMany({});

    // Students with embedded course references
    await students.insertMany([
      {
        name: 'Alice',
        email: 'alice@university.edu',
        enrolledCourses: [
          { courseId: 'CS101', name: 'Intro to CS', grade: 'A' },
          { courseId: 'MATH201', name: 'Calculus II', grade: 'B+' }
        ]
      },
      {
        name: 'Bob',
        email: 'bob@university.edu',
        enrolledCourses: [
          { courseId: 'CS101', name: 'Intro to CS', grade: 'B' },
          { courseId: 'PHY101', name: 'Physics I', grade: 'A-' }
        ]
      }
    ]);

    // Courses with embedded student summaries
    await courses.insertMany([
      {
        courseId: 'CS101',
        name: 'Introduction to Computer Science',
        instructor: 'Dr. Smith',
        enrolledStudents: [
          { name: 'Alice', email: 'alice@university.edu' },
          { name: 'Bob', email: 'bob@university.edu' }
        ],
        capacity: 30,
        enrolled: 2
      }
    ]);
    console.log('  ✓ Two-way embedding completed');

    // Pattern 2: Junction Collection
    console.log('\nPattern 2: Junction Collection (Large datasets)');
    const actors = this.db.collection('actors');
    const movies = this.db.collection('movies');
    const castings = this.db.collection('castings');
    await actors.deleteMany({});
    await movies.deleteMany({});
    await castings.deleteMany({});

    // Insert actors
    const actorResults = await actors.insertMany([
      { name: 'Tom Hanks', birthYear: 1956, country: 'USA' },
      { name: 'Meryl Streep', birthYear: 1949, country: 'USA' },
      { name: 'Leonardo DiCaprio', birthYear: 1974, country: 'USA' }
    ]);

    // Insert movies
    const movieResults = await movies.insertMany([
      { title: 'Forrest Gump', year: 1994, genre: 'Drama' },
      { title: 'Cast Away', year: 2000, genre: 'Adventure' },
      { title: 'The Post', year: 2017, genre: 'Drama' }
    ]);

    // Junction collection with additional relationship data
    const actorIds = Object.values(actorResults.insertedIds);
    const movieIds = Object.values(movieResults.insertedIds);

    await castings.insertMany([
      {
        actorId: actorIds[0], // Tom Hanks
        movieId: movieIds[0], // Forrest Gump
        role: 'Forrest Gump',
        billing: 'Lead'
      },
      {
        actorId: actorIds[0], // Tom Hanks
        movieId: movieIds[1], // Cast Away
        role: 'Chuck Noland',
        billing: 'Lead'
      },
      {
        actorId: actorIds[0], // Tom Hanks
        movieId: movieIds[2], // The Post
        role: 'Ben Bradlee',
        billing: 'Lead'
      },
      {
        actorId: actorIds[1], // Meryl Streep
        movieId: movieIds[2], // The Post
        role: 'Kay Graham',
        billing: 'Lead'
      }
    ]);
    console.log('  ✓ Junction collection created');

    // Query M:N relationships
    console.log('\nQuerying Many-to-Many:');

    // Find all movies for an actor
    const tomHanks = await actors.findOne({ name: 'Tom Hanks' });
    const tomHanksMovies = await castings.aggregate([
      { $match: { actorId: tomHanks._id } },
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $project: {
          title: '$movie.title',
          year: '$movie.year',
          role: 1
        }
      }
    ]).toArray();

    console.log(`  Tom Hanks movies: ${tomHanksMovies.length}`);
    tomHanksMovies.forEach(m => {
      console.log(`    - ${m.title} (${m.year}) as ${m.role}`);
    });
  }

  /**
   * Exercise 3: Tree Structures
   * Hierarchical data modeling patterns
   */
  async treeStructures() {
    console.log('\n=== Exercise 3: Tree Structures ===\n');

    // Pattern 1: Parent References
    console.log('Pattern 1: Parent References');
    const categories = this.db.collection('categories_parent');
    await categories.deleteMany({});

    await categories.insertMany([
      { _id: 'Electronics', parent: null },
      { _id: 'Computers', parent: 'Electronics' },
      { _id: 'Laptops', parent: 'Computers' },
      { _id: 'Desktops', parent: 'Computers' },
      { _id: 'Phones', parent: 'Electronics' },
      { _id: 'Smartphones', parent: 'Phones' },
      { _id: 'Feature Phones', parent: 'Phones' }
    ]);

    // Find all children of a category
    const computerChildren = await categories.find({ parent: 'Computers' }).toArray();
    console.log('  Children of Computers:', computerChildren.map(c => c._id).join(', '));

    // Pattern 2: Child References
    console.log('\nPattern 2: Child References');
    const folders = this.db.collection('folders_children');
    await folders.deleteMany({});

    await folders.insertMany([
      { _id: 'root', name: 'Root', children: ['documents', 'pictures'] },
      { _id: 'documents', name: 'Documents', children: ['work', 'personal'] },
      { _id: 'work', name: 'Work', children: [] },
      { _id: 'personal', name: 'Personal', children: [] },
      { _id: 'pictures', name: 'Pictures', children: ['vacation', 'family'] },
      { _id: 'vacation', name: 'Vacation', children: [] },
      { _id: 'family', name: 'Family', children: [] }
    ]);

    // Find a folder and its children
    const rootFolder = await folders.findOne({ _id: 'root' });
    console.log(`  Root folder children: ${rootFolder.children.join(', ')}`);

    // Pattern 3: Materialized Paths
    console.log('\nPattern 3: Materialized Paths');
    const employees = this.db.collection('employees_path');
    await employees.deleteMany({});

    await employees.insertMany([
      { name: 'CEO', path: ',' },
      { name: 'CTO', path: ',CEO,' },
      { name: 'CFO', path: ',CEO,' },
      { name: 'VP Engineering', path: ',CEO,CTO,' },
      { name: 'VP Sales', path: ',CEO,' },
      { name: 'Engineer 1', path: ',CEO,CTO,VP Engineering,' },
      { name: 'Engineer 2', path: ',CEO,CTO,VP Engineering,' }
    ]);

    // Find all descendants of CTO
    const ctoDescendants = await employees.find({
      path: { $regex: ',CTO,' }
    }).toArray();
    console.log('  CTO descendants:', ctoDescendants.map(e => e.name).join(', '));

    // Pattern 4: Nested Sets
    console.log('\nPattern 4: Array of Ancestors');
    const pages = this.db.collection('pages_ancestors');
    await pages.deleteMany({});

    await pages.insertMany([
      { name: 'Home', ancestors: [] },
      { name: 'Products', ancestors: ['Home'] },
      { name: 'Laptops', ancestors: ['Home', 'Products'] },
      { name: 'Gaming Laptops', ancestors: ['Home', 'Products', 'Laptops'] },
      { name: 'Services', ancestors: ['Home'] },
      { name: 'Support', ancestors: ['Home', 'Services'] }
    ]);

    // Find all pages under Products
    const underProducts = await pages.find({
      ancestors: 'Products'
    }).toArray();
    console.log('  Pages under Products:', underProducts.map(p => p.name).join(', '));
  }

  /**
   * Exercise 4: Polymorphic Collections
   * Single collection for multiple entity types
   */
  async polymorphicCollections() {
    console.log('\n=== Exercise 4: Polymorphic Collections ===\n');

    const activities = this.db.collection('activity_feed');
    await activities.deleteMany({});

    // Different activity types in same collection
    const activityData = [
      {
        type: 'post',
        userId: 'user123',
        timestamp: new Date(),
        data: {
          title: 'My First Post',
          content: 'Hello World!',
          tags: ['introduction', 'hello']
        }
      },
      {
        type: 'comment',
        userId: 'user456',
        timestamp: new Date(),
        data: {
          postId: 'post123',
          text: 'Great post!',
          parentCommentId: null
        }
      },
      {
        type: 'like',
        userId: 'user789',
        timestamp: new Date(),
        data: {
          targetType: 'post',
          targetId: 'post123'
        }
      },
      {
        type: 'share',
        userId: 'user123',
        timestamp: new Date(),
        data: {
          originalPostId: 'post456',
          message: 'Check this out!'
        }
      },
      {
        type: 'follow',
        userId: 'user456',
        timestamp: new Date(),
        data: {
          followedUserId: 'user123'
        }
      }
    ];

    await activities.insertMany(activityData);
    console.log('Inserted polymorphic activity documents');

    // Query by type
    console.log('\nActivity counts by type:');
    const typeCounts = await activities.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    typeCounts.forEach(tc => {
      console.log(`  ${tc._id}: ${tc.count}`);
    });

    // Type-specific queries
    console.log('\nType-specific queries:');

    // Get all posts
    const posts = await activities.find({ type: 'post' }).toArray();
    console.log(`  Posts: ${posts.length}`);

    // Get likes for a specific post
    const postLikes = await activities.countDocuments({
      type: 'like',
      'data.targetType': 'post',
      'data.targetId': 'post123'
    });
    console.log(`  Likes for post123: ${postLikes}`);
  }

  /**
   * Exercise 5: Bucket Pattern
   * Optimize for time-series and IoT data
   */
  async bucketPattern() {
    console.log('\n=== Exercise 5: Bucket Pattern ===\n');

    const sensorBuckets = this.db.collection('sensor_buckets');
    await sensorBuckets.deleteMany({});

    // Create bucketed documents (1 hour buckets)
    const bucketStart = new Date('2024-01-15T10:00:00Z');
    const sensorId = 'sensor-001';

    // Generate readings for one bucket
    const readings = [];
    for (let i = 0; i < 60; i++) { // 60 readings per hour
      readings.push({
        timestamp: new Date(bucketStart.getTime() + i * 60000), // Every minute
        temperature: 20 + Math.random() * 5,
        humidity: 60 + Math.random() * 10,
        pressure: 1013 + Math.random() * 10
      });
    }

    const bucket = {
      sensorId: sensorId,
      bucketStart: bucketStart,
      bucketEnd: new Date(bucketStart.getTime() + 3600000), // 1 hour later
      measurements: readings,
      count: readings.length,
      stats: {
        temperature: {
          min: Math.min(...readings.map(r => r.temperature)),
          max: Math.max(...readings.map(r => r.temperature)),
          avg: readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length
        },
        humidity: {
          min: Math.min(...readings.map(r => r.humidity)),
          max: Math.max(...readings.map(r => r.humidity)),
          avg: readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length
        }
      }
    };

    await sensorBuckets.insertOne(bucket);
    console.log('Created sensor data bucket:');
    console.log(`  Sensor: ${bucket.sensorId}`);
    console.log(`  Period: ${bucket.bucketStart.toISOString()} to ${bucket.bucketEnd.toISOString()}`);
    console.log(`  Measurements: ${bucket.count}`);
    console.log(`  Temp range: ${bucket.stats.temperature.min.toFixed(1)}°C - ${bucket.stats.temperature.max.toFixed(1)}°C`);

    // Query pattern - find specific time range
    const queryTime = new Date('2024-01-15T10:30:00Z');
    const bucketWithTime = await sensorBuckets.findOne({
      sensorId: sensorId,
      bucketStart: { $lte: queryTime },
      bucketEnd: { $gt: queryTime }
    });

    if (bucketWithTime) {
      // Find specific reading within bucket
      const reading = bucketWithTime.measurements.find(m =>
        m.timestamp.getTime() === queryTime.getTime()
      );
      console.log(`\nReading at ${queryTime.toISOString()}:`);
      if (reading) {
        console.log(`  Temperature: ${reading.temperature.toFixed(1)}°C`);
      }
    }
  }

  /**
   * Exercise 6: Computed Pattern
   * Pre-compute and store expensive calculations
   */
  async computedPattern() {
    console.log('\n=== Exercise 6: Computed Pattern ===\n');

    const products = this.db.collection('products_computed');
    const reviews = this.db.collection('reviews');
    await products.deleteMany({});
    await reviews.deleteMany({});

    // Insert product
    const productResult = await products.insertOne({
      name: 'Wireless Headphones',
      price: 99.99,
      category: 'Electronics',
      // Computed fields
      ratingSummary: {
        average: 0,
        count: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        },
        lastUpdated: new Date()
      },
      popularReviews: [] // Cache top reviews
    });

    // Add reviews and update computed fields
    const reviewData = [
      { rating: 5, text: 'Excellent sound quality!', helpful: 45 },
      { rating: 4, text: 'Good value for money', helpful: 32 },
      { rating: 5, text: 'Love these headphones', helpful: 28 },
      { rating: 3, text: 'Average battery life', helpful: 15 },
      { rating: 5, text: 'Best purchase ever!', helpful: 52 }
    ];

    for (const review of reviewData) {
      // Insert review
      await reviews.insertOne({
        productId: productResult.insertedId,
        ...review,
        timestamp: new Date()
      });

      // Update computed fields atomically
      await products.updateOne(
        { _id: productResult.insertedId },
        {
          $inc: {
            'ratingSummary.count': 1,
            [`ratingSummary.distribution.${review.rating}`]: 1
          },
          $set: {
            'ratingSummary.lastUpdated': new Date()
          }
        }
      );
    }

    // Recalculate average
    const product = await products.findOne({ _id: productResult.insertedId });
    const totalRating = Object.entries(product.ratingSummary.distribution)
      .reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0);
    const avgRating = totalRating / product.ratingSummary.count;

    // Update average and cache top reviews
    const topReviews = await reviews
      .find({ productId: productResult.insertedId })
      .sort({ helpful: -1 })
      .limit(3)
      .toArray();

    await products.updateOne(
      { _id: productResult.insertedId },
      {
        $set: {
          'ratingSummary.average': parseFloat(avgRating.toFixed(2)),
          popularReviews: topReviews.map(r => ({
            rating: r.rating,
            text: r.text,
            helpful: r.helpful
          }))
        }
      }
    );

    const finalProduct = await products.findOne({ _id: productResult.insertedId });
    console.log('Product with computed fields:');
    console.log(`  Name: ${finalProduct.name}`);
    console.log(`  Average Rating: ${finalProduct.ratingSummary.average} (${finalProduct.ratingSummary.count} reviews)`);
    console.log('  Rating Distribution:');
    Object.entries(finalProduct.ratingSummary.distribution).reverse().forEach(([rating, count]) => {
      console.log(`    ${rating} stars: ${count}`);
    });
    console.log('  Top Reviews Cached:', finalProduct.popularReviews.length);
  }

  async cleanup() {
    // Clean up collections
    const collections = [
      'users_embedded', 'blog_posts', 'comments', 'servers', 'log_entries',
      'students_embed', 'courses_embed', 'actors', 'movies', 'castings',
      'categories_parent', 'folders_children', 'employees_path', 'pages_ancestors',
      'activity_feed', 'sensor_buckets', 'products_computed', 'reviews'
    ];

    for (const coll of collections) {
      await this.db.collection(coll).drop().catch(() => {});
    }

    await this.client.close();
    console.log('\nCleanup completed');
  }
}

// Main execution
async function main() {
  const exercises = new Lab02AdvancedExercises();

  try {
    await exercises.connect();

    console.log('=== Lab 02 Advanced Modeling Exercises ===');
    console.log('==========================================\n');

    await exercises.oneToManyRelationships();
    await exercises.manyToManyRelationships();
    await exercises.treeStructures();
    await exercises.polymorphicCollections();
    await exercises.bucketPattern();
    await exercises.computedPattern();

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await exercises.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = Lab02AdvancedExercises;
