/**
 * MongoDB Labs Test Framework
 *
 * Comprehensive testing framework for all MongoDB labs with
 * automated validation, performance testing, and reporting.
 */

const { MongoClient } = require('mongodb');
const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');

class LabTestFramework {
  constructor(config = {}) {
    this.config = {
      mongoUri: config.mongoUri || 'mongodb://localhost:27017',
      database: config.database || 'nosql_labs_test',
      timeout: config.timeout || 30000,
      verbose: config.verbose || false,
      ...config
    };

    this.client = null;
    this.db = null;
    this.results = [];
    this.startTime = null;
  }

  async connect() {
    this.client = new MongoClient(this.config.mongoUri);
    await this.client.connect();
    this.db = this.client.db(this.config.database);

    if (this.config.verbose) {
      console.log(`Connected to MongoDB: ${this.config.database}`);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }

  /**
   * Test runner with timeout and error handling
   */
  async runTest(name, testFn, options = {}) {
    const timeout = options.timeout || this.config.timeout;
    const startTime = Date.now();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Test timeout: ${timeout}ms`)), timeout);
    });

    try {
      await Promise.race([
        testFn(),
        timeoutPromise
      ]);

      const duration = Date.now() - startTime;

      this.results.push({
        test: name,
        status: 'PASSED',
        duration,
        timestamp: new Date().toISOString()
      });

      if (this.config.verbose) {
        console.log(`✅ ${name} (${duration}ms)`);
      }

      return { success: true, duration };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.results.push({
        test: name,
        status: 'FAILED',
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      });

      if (this.config.verbose) {
        console.error(`❌ ${name}: ${error.message}`);
      }

      return { success: false, error: error.message, duration };
    }
  }

  /**
   * Test suite runner
   */
  async runSuite(suiteName, tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test Suite: ${suiteName}`);
    console.log('='.repeat(60));

    const suiteStart = Date.now();
    const suiteResults = [];

    for (const test of tests) {
      const result = await this.runTest(test.name, test.fn, test.options);
      suiteResults.push(result);
    }

    const suiteDuration = Date.now() - suiteStart;
    const passed = suiteResults.filter(r => r.success).length;
    const failed = suiteResults.filter(r => !r.success).length;

    console.log(`\nSuite Results: ${passed} passed, ${failed} failed (${suiteDuration}ms)`);

    return {
      suite: suiteName,
      passed,
      failed,
      total: tests.length,
      duration: suiteDuration,
      results: suiteResults
    };
  }

  /**
   * Performance test helper
   */
  async measurePerformance(name, operation, options = {}) {
    const iterations = options.iterations || 100;
    const warmup = options.warmup || 10;

    // Warmup
    for (let i = 0; i < warmup; i++) {
      await operation();
    }

    // Measure
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await operation();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to ms
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = times.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      name,
      iterations,
      avg: avg.toFixed(2),
      p50: p50.toFixed(2),
      p95: p95.toFixed(2),
      p99: p99.toFixed(2),
      min: sorted[0].toFixed(2),
      max: sorted[sorted.length - 1].toFixed(2)
    };
  }

  /**
   * Assertion helpers
   */
  async assertCollectionExists(collectionName) {
    const collections = await this.db.listCollections({ name: collectionName }).toArray();
    assert(collections.length > 0, `Collection ${collectionName} does not exist`);
  }

  async assertDocumentCount(collectionName, expectedCount, operator = '==') {
    const count = await this.db.collection(collectionName).countDocuments();

    switch (operator) {
      case '>':
        assert(count > expectedCount, `Expected > ${expectedCount}, got ${count}`);
        break;
      case '>=':
        assert(count >= expectedCount, `Expected >= ${expectedCount}, got ${count}`);
        break;
      case '<':
        assert(count < expectedCount, `Expected < ${expectedCount}, got ${count}`);
        break;
      case '<=':
        assert(count <= expectedCount, `Expected <= ${expectedCount}, got ${count}`);
        break;
      default:
        assert.equal(count, expectedCount, `Expected ${expectedCount}, got ${count}`);
    }
  }

  async assertIndexExists(collectionName, indexName) {
    const indexes = await this.db.collection(collectionName).listIndexes().toArray();
    const indexNames = indexes.map(idx => idx.name);
    assert(indexNames.includes(indexName), `Index ${indexName} not found in ${collectionName}`);
  }

  async assertQueryResult(collectionName, query, expectedResult) {
    const result = await this.db.collection(collectionName).findOne(query);
    assert.deepEqual(result, expectedResult);
  }

  /**
   * Data validation helpers
   */
  async validateSchema(collectionName, schema) {
    const collection = this.db.collection(collectionName);
    const sample = await collection.findOne();

    if (!sample) {
      throw new Error(`No documents found in ${collectionName}`);
    }

    for (const [field, type] of Object.entries(schema)) {
      assert(field in sample, `Field ${field} not found`);

      if (type !== 'any') {
        const actualType = Array.isArray(sample[field]) ? 'array' : typeof sample[field];
        assert.equal(actualType, type, `Field ${field} type mismatch`);
      }
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    const report = {
      summary: {
        total: this.results.length,
        passed,
        failed,
        successRate: ((passed / this.results.length) * 100).toFixed(2) + '%',
        totalDuration: totalDuration + 'ms',
        averageDuration: (totalDuration / this.results.length).toFixed(2) + 'ms'
      },
      tests: this.results,
      timestamp: new Date().toISOString()
    };

    return report;
  }

  /**
   * Save report to file
   */
  async saveReport(filepath) {
    const report = this.generateReport();
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    console.log(`\nTest report saved to: ${filepath}`);
  }

  /**
   * Print summary
   */
  printSummary() {
    const report = this.generateReport();

    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`Total Duration: ${report.summary.totalDuration}`);
    console.log(`Average Duration: ${report.summary.averageDuration}`);

    if (report.summary.failed > 0) {
      console.log('\nFailed Tests:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          console.log(`  ❌ ${r.test}: ${r.error}`);
        });
    }
  }
}

/**
 * Test data generators
 */
class TestDataGenerator {
  static generateUsers(count) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        username: `user_${i}`,
        email: `user${i}@example.com`,
        age: 18 + Math.floor(Math.random() * 50),
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        active: Math.random() > 0.2
      });
    }
    return users;
  }

  static generateProducts(count) {
    const categories = ['Electronics', 'Books', 'Clothing', 'Food', 'Sports'];
    const products = [];

    for (let i = 0; i < count; i++) {
      products.push({
        name: `Product ${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        price: parseFloat((10 + Math.random() * 990).toFixed(2)),
        stock: Math.floor(Math.random() * 100),
        rating: parseFloat((1 + Math.random() * 4).toFixed(1)),
        tags: Array.from({ length: Math.floor(Math.random() * 5) + 1 },
                        (_, j) => `tag${j}`)
      });
    }
    return products;
  }

  static generateOrders(count, userIds, productIds) {
    const orders = [];

    for (let i = 0; i < count; i++) {
      const itemCount = 1 + Math.floor(Math.random() * 5);
      const items = [];

      for (let j = 0; j < itemCount; j++) {
        items.push({
          product_id: productIds[Math.floor(Math.random() * productIds.length)],
          quantity: 1 + Math.floor(Math.random() * 5),
          price: parseFloat((10 + Math.random() * 200).toFixed(2))
        });
      }

      orders.push({
        order_id: `ORD-${1000 + i}`,
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        items,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      });
    }

    return orders;
  }
}

module.exports = { LabTestFramework, TestDataGenerator };