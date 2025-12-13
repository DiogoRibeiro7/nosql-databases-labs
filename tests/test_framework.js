/**
 * Enhanced Test Framework for MongoDB Labs
 * Provides assertion-based testing with detailed validation
 */

class TestFramework {
  constructor(dbName, collectionName) {
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.db = db.getSiblingDB(dbName);
    this.collection = this.db[collectionName];
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Assert that a condition is true
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Assert that two values are equal
   */
  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
  }

  /**
   * Assert that actual value is greater than expected
   */
  assertGreaterThan(actual, expected, message) {
    if (!(actual > expected)) {
      throw new Error(`${message}\nExpected ${actual} > ${expected}`);
    }
  }

  /**
   * Assert that actual value is less than expected
   */
  assertLessThan(actual, expected, message) {
    if (!(actual < expected)) {
      throw new Error(`${message}\nExpected ${actual} < ${expected}`);
    }
  }

  /**
   * Assert that an array contains a specific value
   */
  assertContains(array, value, message) {
    if (!array.includes(value)) {
      throw new Error(`${message}\nArray does not contain: ${JSON.stringify(value)}`);
    }
  }

  /**
   * Assert that an object has specific properties
   */
  assertHasProperties(obj, properties, message) {
    for (const prop of properties) {
      if (!(prop in obj)) {
        throw new Error(`${message}\nObject missing property: ${prop}`);
      }
    }
  }

  /**
   * Assert document count
   */
  assertDocumentCount(expectedCount, query = {}) {
    const actualCount = this.collection.countDocuments(query);
    this.assertEqual(
      actualCount,
      expectedCount,
      `Document count mismatch for query: ${JSON.stringify(query)}`
    );
  }

  /**
   * Assert query results
   */
  assertQueryResults(query, expectedResults, options = {}) {
    const results = this.collection.find(query).toArray();

    if (options.count !== undefined) {
      this.assertEqual(
        results.length,
        options.count,
        `Result count mismatch for query: ${JSON.stringify(query)}`
      );
    }

    if (options.fields) {
      results.forEach((doc, index) => {
        this.assertHasProperties(
          doc,
          options.fields,
          `Document ${index} missing required fields`
        );
      });
    }

    if (options.validator) {
      results.forEach((doc, index) => {
        try {
          options.validator(doc);
        } catch (e) {
          throw new Error(`Document ${index} validation failed: ${e.message}`);
        }
      });
    }

    if (expectedResults) {
      expectedResults.forEach((expected, index) => {
        const actual = results[index];
        if (!actual) {
          throw new Error(`Missing result at index ${index}`);
        }
        for (const key in expected) {
          this.assertEqual(
            actual[key],
            expected[key],
            `Field mismatch at index ${index}, field: ${key}`
          );
        }
      });
    }

    return results;
  }

  /**
   * Assert aggregation results
   */
  assertAggregationResults(pipeline, expectedResults, options = {}) {
    const results = this.collection.aggregate(pipeline).toArray();

    if (options.count !== undefined) {
      this.assertEqual(
        results.length,
        options.count,
        `Aggregation result count mismatch`
      );
    }

    if (expectedResults) {
      expectedResults.forEach((expected, index) => {
        const actual = results[index];
        if (!actual) {
          throw new Error(`Missing aggregation result at index ${index}`);
        }
        for (const key in expected) {
          if (typeof expected[key] === 'object' && expected[key].$exists !== undefined) {
            // Check field existence
            this.assert(
              (expected[key].$exists && key in actual) ||
              (!expected[key].$exists && !(key in actual)),
              `Field existence mismatch at index ${index}, field: ${key}`
            );
          } else if (typeof expected[key] === 'object' && expected[key].$type !== undefined) {
            // Check field type
            const actualType = typeof actual[key];
            this.assertEqual(
              actualType,
              expected[key].$type,
              `Field type mismatch at index ${index}, field: ${key}`
            );
          } else {
            this.assertEqual(
              actual[key],
              expected[key],
              `Field mismatch at index ${index}, field: ${key}`
            );
          }
        }
      });
    }

    return results;
  }

  /**
   * Test index usage
   */
  assertIndexUsage(query, indexName) {
    const explainResult = this.collection.find(query).explain("executionStats");
    const winningPlan = explainResult.executionStats.executionStages;

    this.assert(
      winningPlan.stage === "IXSCAN" || winningPlan.stage === "FETCH",
      `Query not using index. Stage: ${winningPlan.stage}`
    );

    if (indexName && winningPlan.inputStage) {
      this.assertEqual(
        winningPlan.inputStage.indexName,
        indexName,
        `Query not using expected index`
      );
    }
  }

  /**
   * Test query performance
   */
  assertQueryPerformance(query, maxTimeMs, maxDocsExamined) {
    const explainResult = this.collection.find(query).explain("executionStats");
    const stats = explainResult.executionStats;

    if (maxTimeMs !== undefined) {
      this.assertLessThan(
        stats.executionTimeMillis,
        maxTimeMs,
        `Query took too long: ${stats.executionTimeMillis}ms`
      );
    }

    if (maxDocsExamined !== undefined) {
      this.assertLessThan(
        stats.totalDocsExamined,
        maxDocsExamined,
        `Query examined too many documents: ${stats.totalDocsExamined}`
      );
    }
  }

  /**
   * Run a test case
   */
  test(name, testFunction) {
    const testResult = {
      name: name,
      status: 'pending',
      error: null,
      duration: 0
    };

    const startTime = new Date();

    try {
      testFunction.call(this);
      testResult.status = 'passed';
      this.results.passed++;
      print(`✅ ${name}`);
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.message;
      this.results.failed++;
      print(`❌ ${name}`);
      print(`   Error: ${error.message}`);
    }

    testResult.duration = new Date() - startTime;
    this.results.tests.push(testResult);
  }

  /**
   * Run a test suite
   */
  suite(name, suiteFunction) {
    print(`\n📋 Test Suite: ${name}`);
    print("=" . repeat(50));
    suiteFunction.call(this);
  }

  /**
   * Setup before tests
   */
  beforeAll(setupFunction) {
    try {
      setupFunction.call(this);
      print("✅ Setup completed successfully");
    } catch (error) {
      print(`❌ Setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cleanup after tests
   */
  afterAll(cleanupFunction) {
    try {
      cleanupFunction.call(this);
      print("✅ Cleanup completed successfully");
    } catch (error) {
      print(`❌ Cleanup failed: ${error.message}`);
    }
  }

  /**
   * Print test summary
   */
  summary() {
    print("\n" + "=" . repeat(50));
    print("📊 Test Summary");
    print("=" . repeat(50));
    print(`✅ Passed: ${this.results.passed}`);
    print(`❌ Failed: ${this.results.failed}`);
    print(`📝 Total: ${this.results.passed + this.results.failed}`);

    if (this.results.failed > 0) {
      print("\n❌ Failed Tests:");
      this.results.tests
        .filter(t => t.status === 'failed')
        .forEach(t => {
          print(`   - ${t.name}`);
          print(`     ${t.error}`);
        });
    }

    const totalDuration = this.results.tests.reduce((sum, t) => sum + t.duration, 0);
    print(`\n⏱️  Total time: ${totalDuration}ms`);

    return this.results.failed === 0;
  }
}

// Helper function for performance testing
function measureQueryTime(collection, query, iterations = 10) {
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = new Date();
    collection.find(query).toArray();
    const end = new Date();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);

  return { avg, max, min, times };
}

// Export for use in other test files
if (typeof module !== 'undefined') {
  module.exports = { TestFramework, measureQueryTime };
}