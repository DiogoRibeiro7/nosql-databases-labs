/**
 * Lab 01 - Introduction to MongoDB
 * Advanced Exercises
 *
 * These exercises extend the basic lab with more complex scenarios
 * and real-world use cases.
 */

const { MongoClient } = require('mongodb');

class Lab01AdvancedExercises {
  constructor(connectionUrl) {
    this.connectionUrl = connectionUrl || 'mongodb://localhost:27017';
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionUrl);
    await this.client.connect();
    this.db = this.client.db('lab01_advanced');
    console.log('Connected to MongoDB - Lab 01 Advanced');
  }

  /**
   * Exercise 1: Working with Embedded Documents
   * Learn to handle nested document structures
   */
  async embeddedDocuments() {
    console.log('\n=== Exercise 1: Embedded Documents ===\n');

    const users = this.db.collection('users_with_profiles');
    await users.deleteMany({});

    // Insert users with embedded profiles
    const userData = [
      {
        username: 'alice',
        email: 'alice@example.com',
        profile: {
          firstName: 'Alice',
          lastName: 'Smith',
          age: 28,
          interests: ['reading', 'coding', 'hiking'],
          address: {
            street: '123 Main St',
            city: 'Boston',
            country: 'USA',
            zipCode: '02101'
          },
          social: {
            twitter: '@alice',
            github: 'alice-smith',
            linkedin: 'alice-smith-pro'
          }
        },
        settings: {
          notifications: {
            email: true,
            push: false,
            sms: true
          },
          privacy: {
            profileVisible: true,
            showEmail: false
          }
        }
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        profile: {
          firstName: 'Bob',
          lastName: 'Johnson',
          age: 35,
          interests: ['photography', 'travel', 'cooking'],
          address: {
            street: '456 Oak Ave',
            city: 'New York',
            country: 'USA',
            zipCode: '10001'
          },
          social: {
            twitter: '@bob_j',
            instagram: 'bob_photos'
          }
        },
        settings: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisible: false,
            showEmail: false
          }
        }
      }
    ];

    await users.insertMany(userData);
    console.log('Inserted users with embedded documents');

    // Query nested fields
    console.log('\n1. Find users in Boston:');
    const bostonUsers = await users.find({
      'profile.address.city': 'Boston'
    }).toArray();
    console.log(`  Found ${bostonUsers.length} users`);

    // Update nested fields
    console.log('\n2. Update Alice\'s age:');
    const updateResult = await users.updateOne(
      { username: 'alice' },
      { $set: { 'profile.age': 29 } }
    );
    console.log(`  Modified ${updateResult.modifiedCount} document`);

    // Add to nested array
    console.log('\n3. Add interest to Bob:');
    await users.updateOne(
      { username: 'bob' },
      { $push: { 'profile.interests': 'music' } }
    );

    // Query with array contains
    console.log('\n4. Find users interested in coding:');
    const coders = await users.find({
      'profile.interests': 'coding'
    }).toArray();
    coders.forEach(user => {
      console.log(`  - ${user.username}: ${user.profile.interests.join(', ')}`);
    });

    // Complex update with multiple operations
    console.log('\n5. Complex update operation:');
    await users.updateOne(
      { username: 'alice' },
      {
        $set: { 'settings.theme': 'dark' },
        $inc: { 'profile.age': 1 },
        $addToSet: { 'profile.interests': 'gaming' }
      }
    );

    const alice = await users.findOne({ username: 'alice' });
    console.log(`  Alice's age: ${alice.profile.age}`);
    console.log(`  Interests: ${alice.profile.interests.join(', ')}`);
  }

  /**
   * Exercise 2: Array Operations
   * Master MongoDB array operators
   */
  async arrayOperations() {
    console.log('\n=== Exercise 2: Array Operations ===\n');

    const products = this.db.collection('products_inventory');
    await products.deleteMany({});

    // Insert products with array fields
    const productData = [
      {
        name: 'Laptop Pro',
        tags: ['electronics', 'computers', 'premium'],
        reviews: [
          { user: 'user1', rating: 5, comment: 'Excellent!' },
          { user: 'user2', rating: 4, comment: 'Good value' },
          { user: 'user3', rating: 5, comment: 'Fast delivery' }
        ],
        specifications: [
          { key: 'RAM', value: '16GB' },
          { key: 'Storage', value: '512GB SSD' },
          { key: 'Processor', value: 'Intel i7' }
        ],
        availability: [
          { warehouse: 'NYC', quantity: 50 },
          { warehouse: 'LA', quantity: 30 },
          { warehouse: 'Chicago', quantity: 20 }
        ]
      },
      {
        name: 'Wireless Mouse',
        tags: ['electronics', 'accessories', 'wireless'],
        reviews: [
          { user: 'user4', rating: 4, comment: 'Works great' },
          { user: 'user5', rating: 3, comment: 'Battery life could be better' }
        ],
        specifications: [
          { key: 'Connection', value: 'Bluetooth 5.0' },
          { key: 'Battery', value: 'AAA' }
        ],
        availability: [
          { warehouse: 'NYC', quantity: 200 },
          { warehouse: 'LA', quantity: 150 }
        ]
      }
    ];

    await products.insertMany(productData);

    // $elemMatch - Find documents with specific array element
    console.log('1. Products with 5-star reviews:');
    const fiveStarProducts = await products.find({
      reviews: { $elemMatch: { rating: 5 } }
    }).toArray();
    fiveStarProducts.forEach(p => {
      const fiveStarCount = p.reviews.filter(r => r.rating === 5).length;
      console.log(`  - ${p.name}: ${fiveStarCount} five-star reviews`);
    });

    // $all - Find documents containing all specified elements
    console.log('\n2. Products with specific tags:');
    const premiumElectronics = await products.find({
      tags: { $all: ['electronics', 'premium'] }
    }).toArray();
    console.log(`  Found ${premiumElectronics.length} premium electronics`);

    // $size - Find arrays of specific length
    console.log('\n3. Products with exactly 2 specifications:');
    const twoSpecs = await products.find({
      specifications: { $size: 2 }
    }).toArray();
    twoSpecs.forEach(p => {
      console.log(`  - ${p.name}`);
    });

    // Array update operators
    console.log('\n4. Array update operations:');

    // $push with $each and $position
    await products.updateOne(
      { name: 'Wireless Mouse' },
      {
        $push: {
          tags: {
            $each: ['best-seller', 'discount'],
            $position: 1
          }
        }
      }
    );

    // $pull - Remove array elements
    await products.updateOne(
      { name: 'Laptop Pro' },
      { $pull: { reviews: { rating: { $lt: 5 } } } }
    );

    // $pop - Remove first/last element
    await products.updateOne(
      { name: 'Wireless Mouse' },
      { $pop: { tags: -1 } } // Remove first element
    );

    // Array filters in updates
    console.log('\n5. Update specific array elements:');
    await products.updateOne(
      { name: 'Laptop Pro' },
      { $inc: { 'availability.$[elem].quantity': 10 } },
      { arrayFilters: [{ 'elem.warehouse': 'NYC' }] }
    );

    const laptop = await products.findOne({ name: 'Laptop Pro' });
    const nycStock = laptop.availability.find(a => a.warehouse === 'NYC');
    console.log(`  NYC stock updated to: ${nycStock.quantity}`);
  }

  /**
   * Exercise 3: Transactions
   * Learn multi-document ACID transactions
   */
  async transactions() {
    console.log('\n=== Exercise 3: Transactions ===\n');

    const accounts = this.db.collection('bank_accounts');
    const transactions = this.db.collection('transaction_log');

    await accounts.deleteMany({});
    await transactions.deleteMany({});

    // Create initial accounts
    await accounts.insertMany([
      { accountId: 'ACC001', holder: 'Alice', balance: 1000 },
      { accountId: 'ACC002', holder: 'Bob', balance: 500 }
    ]);

    console.log('Initial balances:');
    const initial = await accounts.find({}).toArray();
    initial.forEach(acc => {
      console.log(`  ${acc.holder}: $${acc.balance}`);
    });

    // Perform a transaction
    const session = this.client.startSession();

    try {
      await session.withTransaction(async () => {
        const amount = 100;

        // Debit from Alice
        const debitResult = await accounts.updateOne(
          { accountId: 'ACC001' },
          { $inc: { balance: -amount } },
          { session }
        );

        if (debitResult.modifiedCount === 0) {
          throw new Error('Failed to debit account');
        }

        // Credit to Bob
        const creditResult = await accounts.updateOne(
          { accountId: 'ACC002' },
          { $inc: { balance: amount } },
          { session }
        );

        if (creditResult.modifiedCount === 0) {
          throw new Error('Failed to credit account');
        }

        // Log transaction
        await transactions.insertOne({
          from: 'ACC001',
          to: 'ACC002',
          amount: amount,
          timestamp: new Date(),
          status: 'completed'
        }, { session });

        console.log(`\nTransaction completed: Transferred $${amount} from Alice to Bob`);
      });

    } catch (error) {
      console.error('Transaction failed:', error.message);
    } finally {
      await session.endSession();
    }

    console.log('\nFinal balances:');
    const final = await accounts.find({}).toArray();
    final.forEach(acc => {
      console.log(`  ${acc.holder}: $${acc.balance}`);
    });

    // Show transaction log
    console.log('\nTransaction log:');
    const log = await transactions.find({}).toArray();
    log.forEach(tx => {
      console.log(`  ${tx.timestamp.toISOString()}: $${tx.amount} from ${tx.from} to ${tx.to}`);
    });
  }

  /**
   * Exercise 4: Text Search
   * Implement full-text search capabilities
   */
  async textSearch() {
    console.log('\n=== Exercise 4: Text Search ===\n');

    const articles = this.db.collection('articles');
    await articles.deleteMany({});

    // Insert articles
    const articleData = [
      {
        title: 'Introduction to MongoDB',
        content: 'MongoDB is a popular NoSQL database that stores data in flexible JSON-like documents.',
        tags: ['database', 'nosql', 'mongodb'],
        author: 'Alice',
        published: new Date('2024-01-15')
      },
      {
        title: 'Advanced MongoDB Queries',
        content: 'Learn how to write complex queries using aggregation pipeline and advanced operators.',
        tags: ['mongodb', 'queries', 'tutorial'],
        author: 'Bob',
        published: new Date('2024-01-20')
      },
      {
        title: 'Database Performance Tuning',
        content: 'Tips and tricks for optimizing database performance including indexing strategies.',
        tags: ['performance', 'database', 'optimization'],
        author: 'Charlie',
        published: new Date('2024-01-25')
      },
      {
        title: 'NoSQL vs SQL Databases',
        content: 'Comparison between NoSQL and traditional SQL databases, when to use each type.',
        tags: ['database', 'nosql', 'sql', 'comparison'],
        author: 'Alice',
        published: new Date('2024-01-30')
      }
    ];

    await articles.insertMany(articleData);

    // Create text index
    await articles.createIndex({ title: 'text', content: 'text' });
    console.log('Created text index on title and content fields');

    // Text search examples
    console.log('\n1. Search for "mongodb":');
    const mongodbArticles = await articles.find({
      $text: { $search: 'mongodb' }
    }).toArray();
    mongodbArticles.forEach(art => {
      console.log(`  - ${art.title}`);
    });

    // Text search with score
    console.log('\n2. Search with relevance score:');
    const scoredResults = await articles.find(
      { $text: { $search: 'database performance' } },
      { projection: { score: { $meta: 'textScore' }, title: 1 } }
    ).sort({ score: { $meta: 'textScore' } }).toArray();

    scoredResults.forEach(art => {
      console.log(`  - ${art.title} (score: ${art.score.toFixed(2)})`);
    });

    // Phrase search
    console.log('\n3. Exact phrase search:');
    const phraseResults = await articles.find({
      $text: { $search: '"NoSQL database"' }
    }).toArray();
    console.log(`  Found ${phraseResults.length} articles with exact phrase`);

    // Exclude terms
    console.log('\n4. Search with exclusions:');
    const excludeResults = await articles.find({
      $text: { $search: 'database -sql' }
    }).toArray();
    excludeResults.forEach(art => {
      console.log(`  - ${art.title}`);
    });
  }

  /**
   * Exercise 5: Geospatial Queries
   * Work with location-based data
   */
  async geospatialQueries() {
    console.log('\n=== Exercise 5: Geospatial Queries ===\n');

    const locations = this.db.collection('restaurants');
    await locations.deleteMany({});

    // Insert restaurant locations
    const restaurants = [
      {
        name: 'Pizza Palace',
        location: { type: 'Point', coordinates: [-73.97, 40.77] }, // NYC
        category: 'Italian',
        rating: 4.5
      },
      {
        name: 'Sushi Bar',
        location: { type: 'Point', coordinates: [-73.98, 40.76] }, // NYC
        category: 'Japanese',
        rating: 4.8
      },
      {
        name: 'Burger Joint',
        location: { type: 'Point', coordinates: [-73.99, 40.75] }, // NYC
        category: 'American',
        rating: 4.2
      },
      {
        name: 'Taco Stand',
        location: { type: 'Point', coordinates: [-118.25, 34.05] }, // LA
        category: 'Mexican',
        rating: 4.6
      }
    ];

    await locations.insertMany(restaurants);

    // Create 2dsphere index
    await locations.createIndex({ location: '2dsphere' });
    console.log('Created geospatial index');

    // Find nearby locations
    console.log('\n1. Find restaurants near coordinates:');
    const near = await locations.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [-73.98, 40.76] },
          $maxDistance: 1000 // meters
        }
      }
    }).toArray();

    near.forEach(r => {
      console.log(`  - ${r.name} (${r.category})`);
    });

    // Find within a specific area
    console.log('\n2. Find restaurants in polygon area:');
    const polygon = {
      type: 'Polygon',
      coordinates: [[
        [-74, 40.7],
        [-73.9, 40.7],
        [-73.9, 40.8],
        [-74, 40.8],
        [-74, 40.7]
      ]]
    };

    const within = await locations.find({
      location: { $geoWithin: { $geometry: polygon } }
    }).toArray();

    console.log(`  Found ${within.length} restaurants in the area`);

    // Calculate distances
    console.log('\n3. Restaurants with distance from point:');
    const withDistance = await locations.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [-73.98, 40.76] },
          distanceField: 'distance',
          maxDistance: 5000,
          spherical: true
        }
      },
      {
        $project: {
          name: 1,
          distance: { $round: ['$distance', 0] }
        }
      }
    ]).toArray();

    withDistance.forEach(r => {
      console.log(`  - ${r.name}: ${r.distance}m away`);
    });
  }

  /**
   * Exercise 6: TTL Collections
   * Automatic document expiration
   */
  async ttlCollections() {
    console.log('\n=== Exercise 6: TTL Collections ===\n');

    const sessions = this.db.collection('user_sessions');
    await sessions.deleteMany({});

    // Create TTL index (documents expire after 30 seconds)
    await sessions.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 30 }
    );
    console.log('Created TTL index (30 seconds expiration)');

    // Insert session documents
    const sessionData = [
      {
        sessionId: 'sess-001',
        userId: 'user-001',
        createdAt: new Date(),
        data: { page: 'home', device: 'mobile' }
      },
      {
        sessionId: 'sess-002',
        userId: 'user-002',
        createdAt: new Date(Date.now() - 20000), // 20 seconds ago
        data: { page: 'products', device: 'desktop' }
      },
      {
        sessionId: 'sess-003',
        userId: 'user-003',
        createdAt: new Date(Date.now() - 40000), // 40 seconds ago
        data: { page: 'checkout', device: 'tablet' }
      }
    ];

    await sessions.insertMany(sessionData);

    console.log('\nInitial session count:');
    const initialCount = await sessions.countDocuments();
    console.log(`  ${initialCount} sessions`);

    console.log('\nWaiting 35 seconds for TTL to expire old documents...');
    await new Promise(resolve => setTimeout(resolve, 35000));

    console.log('\nSession count after TTL expiration:');
    const finalCount = await sessions.countDocuments();
    console.log(`  ${finalCount} sessions remaining`);

    const remaining = await sessions.find({}).toArray();
    remaining.forEach(s => {
      const age = Math.floor((Date.now() - s.createdAt) / 1000);
      console.log(`  - ${s.sessionId}: ${age} seconds old`);
    });
  }

  async cleanup() {
    // Clean up collections
    const collections = [
      'users_with_profiles', 'products_inventory',
      'bank_accounts', 'transaction_log',
      'articles', 'restaurants', 'user_sessions'
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
  const exercises = new Lab01AdvancedExercises();

  try {
    await exercises.connect();

    console.log('=== Lab 01 Advanced Exercises ===');
    console.log('==================================\n');

    await exercises.embeddedDocuments();
    await exercises.arrayOperations();
    await exercises.transactions();
    await exercises.textSearch();
    await exercises.geospatialQueries();
    // TTL exercise commented out due to 35-second wait
    // await exercises.ttlCollections();

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

module.exports = Lab01AdvancedExercises;