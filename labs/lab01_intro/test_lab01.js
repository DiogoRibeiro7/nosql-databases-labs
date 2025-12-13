/**
 * Lab 01 - Introduction to MongoDB
 * Comprehensive Test Suite
 */

const { LabTestFramework, TestDataGenerator } = require('../test_framework');
const { MongoClient } = require('mongodb');
const assert = require('assert');

class Lab01Tests {
  constructor() {
    this.framework = new LabTestFramework({
      database: 'lab01_test',
      verbose: true
    });
  }

  async setupTestData() {
    const db = this.framework.db;

    // Clear existing data
    const collections = ['users', 'products', 'orders'];
    for (const coll of collections) {
      await db.collection(coll).deleteMany({});
    }

    // Insert test data
    const users = TestDataGenerator.generateUsers(100);
    const products = TestDataGenerator.generateProducts(50);

    const userResult = await db.collection('users').insertMany(users);
    const productResult = await db.collection('products').insertMany(products);

    const orders = TestDataGenerator.generateOrders(
      200,
      Object.values(userResult.insertedIds),
      Object.values(productResult.insertedIds)
    );

    await db.collection('orders').insertMany(orders);
  }

  getTests() {
    return [
      {
        name: 'Connection and Database Creation',
        fn: async () => {
          const adminDb = this.framework.client.db().admin();
          const dbs = await adminDb.listDatabases();
          const dbNames = dbs.databases.map(d => d.name);
          assert(dbNames.includes('lab01_test'), 'Test database not created');
        }
      },

      {
        name: 'Collection Creation',
        fn: async () => {
          await this.framework.assertCollectionExists('users');
          await this.framework.assertCollectionExists('products');
          await this.framework.assertCollectionExists('orders');
        }
      },

      {
        name: 'Insert Single Document',
        fn: async () => {
          const testDoc = {
            test_id: 'test_001',
            name: 'Test Document',
            timestamp: new Date()
          };

          const result = await this.framework.db.collection('test_collection')
            .insertOne(testDoc);

          assert(result.acknowledged, 'Insert not acknowledged');
          assert(result.insertedId, 'No insertedId returned');
        }
      },

      {
        name: 'Insert Multiple Documents',
        fn: async () => {
          const docs = Array.from({ length: 10 }, (_, i) => ({
            batch_id: i,
            value: Math.random()
          }));

          const result = await this.framework.db.collection('test_batch')
            .insertMany(docs);

          assert.equal(result.insertedCount, 10, 'Incorrect insert count');
        }
      },

      {
        name: 'Find Documents',
        fn: async () => {
          const users = await this.framework.db.collection('users')
            .find({ age: { $gte: 30 } })
            .toArray();

          assert(users.length > 0, 'No users found');
          users.forEach(user => {
            assert(user.age >= 30, 'Age filter not working');
          });
        }
      },

      {
        name: 'Find One Document',
        fn: async () => {
          const user = await this.framework.db.collection('users')
            .findOne({ username: 'user_0' });

          assert(user, 'User not found');
          assert.equal(user.username, 'user_0', 'Wrong user returned');
        }
      },

      {
        name: 'Update Document',
        fn: async () => {
          const updateResult = await this.framework.db.collection('users')
            .updateOne(
              { username: 'user_1' },
              { $set: { updated: true, last_modified: new Date() } }
            );

          assert(updateResult.acknowledged, 'Update not acknowledged');
          assert.equal(updateResult.modifiedCount, 1, 'Document not modified');

          const updated = await this.framework.db.collection('users')
            .findOne({ username: 'user_1' });
          assert(updated.updated === true, 'Update not applied');
        }
      },

      {
        name: 'Update Multiple Documents',
        fn: async () => {
          const result = await this.framework.db.collection('users')
            .updateMany(
              { age: { $lt: 25 } },
              { $set: { category: 'young' } }
            );

          assert(result.acknowledged, 'Update not acknowledged');

          const young = await this.framework.db.collection('users')
            .find({ category: 'young' })
            .toArray();

          young.forEach(user => {
            assert(user.age < 25, 'Incorrect categorization');
          });
        }
      },

      {
        name: 'Delete Document',
        fn: async () => {
          // Insert a document to delete
          await this.framework.db.collection('temp')
            .insertOne({ _id: 'to_delete', value: 123 });

          const deleteResult = await this.framework.db.collection('temp')
            .deleteOne({ _id: 'to_delete' });

          assert.equal(deleteResult.deletedCount, 1, 'Document not deleted');

          const found = await this.framework.db.collection('temp')
            .findOne({ _id: 'to_delete' });
          assert(!found, 'Document still exists');
        }
      },

      {
        name: 'Count Documents',
        fn: async () => {
          const totalCount = await this.framework.db.collection('users')
            .countDocuments();
          assert.equal(totalCount, 100, 'Incorrect total count');

          const filteredCount = await this.framework.db.collection('users')
            .countDocuments({ active: true });
          assert(filteredCount > 0, 'No active users found');
        }
      },

      {
        name: 'Distinct Values',
        fn: async () => {
          const categories = await this.framework.db.collection('products')
            .distinct('category');

          assert(Array.isArray(categories), 'Distinct did not return array');
          assert(categories.length > 0, 'No distinct categories found');
        }
      },

      {
        name: 'Sort Documents',
        fn: async () => {
          const sorted = await this.framework.db.collection('products')
            .find()
            .sort({ price: -1 })
            .limit(5)
            .toArray();

          for (let i = 1; i < sorted.length; i++) {
            assert(sorted[i - 1].price >= sorted[i].price, 'Incorrect sort order');
          }
        }
      },

      {
        name: 'Projection',
        fn: async () => {
          const projected = await this.framework.db.collection('users')
            .find({}, { projection: { username: 1, email: 1, _id: 0 } })
            .limit(5)
            .toArray();

          projected.forEach(doc => {
            assert('username' in doc, 'username not projected');
            assert('email' in doc, 'email not projected');
            assert(!('age' in doc), 'age should not be projected');
            assert(!('_id' in doc), '_id should not be projected');
          });
        }
      },

      {
        name: 'Skip and Limit',
        fn: async () => {
          const page1 = await this.framework.db.collection('products')
            .find()
            .sort({ name: 1 })
            .limit(10)
            .toArray();

          const page2 = await this.framework.db.collection('products')
            .find()
            .sort({ name: 1 })
            .skip(10)
            .limit(10)
            .toArray();

          assert.equal(page1.length, 10, 'Page 1 size incorrect');
          assert.equal(page2.length, 10, 'Page 2 size incorrect');
          assert.notEqual(page1[0]._id, page2[0]._id, 'Pages are the same');
        }
      },

      {
        name: 'Bulk Operations',
        fn: async () => {
          const bulk = this.framework.db.collection('bulk_test')
            .initializeUnorderedBulkOp();

          bulk.insert({ type: 'bulk', value: 1 });
          bulk.insert({ type: 'bulk', value: 2 });
          bulk.find({ type: 'bulk', value: 1 }).updateOne({ $set: { updated: true } });
          bulk.find({ type: 'bulk', value: 2 }).deleteOne();

          const result = await bulk.execute();
          assert(result.ok === 1, 'Bulk operation failed');
        }
      }
    ];
  }

  getPerformanceTests() {
    return [
      {
        name: 'Insert Performance',
        fn: async () => {
          const perf = await this.framework.measurePerformance(
            'Single Insert',
            async () => {
              await this.framework.db.collection('perf_test')
                .insertOne({ value: Math.random() });
            },
            { iterations: 100, warmup: 10 }
          );

          console.log('\nInsert Performance:');
          console.log(`  Average: ${perf.avg}ms`);
          console.log(`  P50: ${perf.p50}ms`);
          console.log(`  P95: ${perf.p95}ms`);

          assert(parseFloat(perf.avg) < 50, 'Insert too slow');
        }
      },

      {
        name: 'Query Performance',
        fn: async () => {
          const perf = await this.framework.measurePerformance(
            'Simple Query',
            async () => {
              await this.framework.db.collection('users')
                .findOne({ username: `user_${Math.floor(Math.random() * 100)}` });
            },
            { iterations: 100, warmup: 10 }
          );

          console.log('\nQuery Performance:');
          console.log(`  Average: ${perf.avg}ms`);
          console.log(`  P50: ${perf.p50}ms`);
          console.log(`  P95: ${perf.p95}ms`);

          assert(parseFloat(perf.avg) < 10, 'Query too slow');
        }
      }
    ];
  }

  async run() {
    try {
      await this.framework.connect();
      await this.setupTestData();

      // Run functional tests
      await this.framework.runSuite('Lab 01 - Basic Operations', this.getTests());

      // Run performance tests
      await this.framework.runSuite('Lab 01 - Performance', this.getPerformanceTests());

      // Generate report
      this.framework.printSummary();
      await this.framework.saveReport('lab01_test_report.json');

    } finally {
      await this.framework.disconnect();
    }
  }
}

// Run tests
if (require.main === module) {
  const tests = new Lab01Tests();
  tests.run().catch(console.error);
}

module.exports = Lab01Tests;