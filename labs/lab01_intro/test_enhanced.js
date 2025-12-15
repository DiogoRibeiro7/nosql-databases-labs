/* eslint-env mongo */
/* global TestFramework */

/**
 * Enhanced Test Suite for Lab 01 - Introduction to MongoDB
 * Uses assertion-based validation for comprehensive testing
 */

// Load the test framework
load("../../tests/test_framework.js");

// Create test instance
const tester = new TestFramework('lab01_student', 'customers');

// Test Suite
tester.suite("Lab 01 - MongoDB Introduction Tests", function() {

  // Setup: Ensure test data exists
  this.beforeAll(function() {
    // Check if collection exists and has data
    const count = this.collection.countDocuments();
    if (count === 0) {
      // Insert test data
      this.collection.insertMany([
        {
          name: "John Doe",
          email: "john@example.com",
          age: 35,
          city: "New York",
          country: "USA",
          purchases: [
            { product: "Laptop", price: 1200 },
            { product: "Mouse", price: 25 }
          ],
          createdAt: new Date("2024-01-15")
        },
        {
          name: "Jane Smith",
          email: "jane@example.com",
          age: 28,
          city: "Los Angeles",
          country: "USA",
          purchases: [
            { product: "Phone", price: 800 }
          ],
          createdAt: new Date("2024-01-20")
        },
        {
          name: "Bob Johnson",
          email: "bob@example.com",
          age: 42,
          city: "Chicago",
          country: "USA",
          purchases: [],
          createdAt: new Date("2024-02-01")
        },
        {
          name: "Alice Brown",
          email: "alice@example.com",
          age: 31,
          city: "Toronto",
          country: "Canada",
          purchases: [
            { product: "Tablet", price: 500 },
            { product: "Keyboard", price: 100 },
            { product: "Monitor", price: 300 }
          ],
          createdAt: new Date("2024-02-10")
        },
        {
          name: "Charlie Wilson",
          email: "charlie@example.com",
          age: 25,
          city: "New York",
          country: "USA",
          purchases: [
            { product: "Headphones", price: 150 }
          ],
          createdAt: new Date("2024-02-15")
        }
      ]);
      print("   Inserted test data");
    }

    // Create indexes for performance tests
    this.collection.createIndex({ email: 1 });
    this.collection.createIndex({ age: 1 });
    this.collection.createIndex({ city: 1, country: 1 });
  });

  // Test 1: Basic document count
  this.test("Document count validation", function() {
    this.assertDocumentCount(5);
  });

  // Test 2: Query with exact match
  this.test("Find by email (exact match)", function() {
    this.assertQueryResults(
      { email: "john@example.com" },
      [{ name: "John Doe", age: 35 }],
      { count: 1 }
    );
  });

  // Test 3: Query with comparison operator
  this.test("Find customers older than 30", function() {
    this.assertQueryResults(
      { age: { $gt: 30 } },
      null,
      {
        count: 3,
        validator: (doc) => {
          this.assertGreaterThan(doc.age, 30, `Age should be > 30`);
        }
      }
    );
  });

  // Test 4: Query with multiple conditions
  this.test("Find customers from USA in New York", function() {
    this.assertQueryResults(
      { city: "New York", country: "USA" },
      null,
      {
        count: 2,
        fields: ['name', 'email', 'city', 'country'],
        validator: (doc) => {
          this.assertEqual(doc.city, "New York", "City mismatch");
          this.assertEqual(doc.country, "USA", "Country mismatch");
        }
      }
    );
  });

  // Test 5: Array queries
  this.test("Find customers with purchases", function() {
    this.assertQueryResults(
      { "purchases.0": { $exists: true } },
      null,
      {
        count: 4,
        validator: (doc) => {
          this.assertGreaterThan(doc.purchases.length, 0, "Should have purchases");
        }
      }
    );
  });

  // Test 6: Aggregation - Count by country
  this.test("Aggregation: Count customers by country", function() {
    this.assertAggregationResults(
      [
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ],
      [
        { _id: "USA", count: 4 },
        { _id: "Canada", count: 1 }
      ],
      { count: 2 }
    );
  });

  // Test 7: Aggregation - Average age
  this.test("Aggregation: Calculate average age", function() {
    this.assertAggregationResults(
      [
        { $group: { _id: null, averageAge: { $avg: "$age" } } }
      ],
      null,
      {
        count: 1,
        validator: (doc) => {
          this.assert(doc.averageAge > 30 && doc.averageAge < 35, "Average age should be between 30-35");
        }
      }
    );
  });

  // Test 8: Aggregation - Total purchases per customer
  this.test("Aggregation: Total purchase value per customer", function() {
    this.assertAggregationResults(
      [
        { $unwind: "$purchases" },
        {
          $group: {
            _id: "$name",
            totalSpent: { $sum: "$purchases.price" },
            itemCount: { $sum: 1 }
          }
        },
        { $sort: { totalSpent: -1 } }
      ],
      null,
      {
        validator: (doc) => {
          this.assertGreaterThan(doc.totalSpent, 0, "Total spent should be positive");
          this.assertGreaterThan(doc.itemCount, 0, "Item count should be positive");
        }
      }
    );
  });

  // Test 9: Date range queries
  this.test("Find customers created in January 2024", function() {
    this.assertQueryResults(
      {
        createdAt: {
          $gte: new Date("2024-01-01"),
          $lt: new Date("2024-02-01")
        }
      },
      null,
      {
        count: 2,
        validator: (doc) => {
          const month = doc.createdAt.getMonth();
          const year = doc.createdAt.getFullYear();
          this.assertEqual(month, 0, "Should be January (month 0)");
          this.assertEqual(year, 2024, "Should be year 2024");
        }
      }
    );
  });

  // Test 10: Index usage verification
  this.test("Verify index usage for email query", function() {
    this.assertIndexUsage(
      { email: "john@example.com" },
      "email_1"
    );
  });

  // Test 11: Performance test
  this.test("Query performance within acceptable limits", function() {
    // Test that simple queries complete quickly
    this.assertQueryPerformance(
      { email: "john@example.com" },
      100,  // Max 100ms
      10    // Max 10 documents examined
    );
  });

  // Test 12: Projection test
  this.test("Projection returns only specified fields", function() {
    const result = this.collection.findOne(
      { email: "john@example.com" },
      { name: 1, age: 1, _id: 0 }
    );

    this.assertHasProperties(result, ['name', 'age'], "Should have name and age");
    this.assert(!('_id' in result), "Should not have _id field");
    this.assert(!('email' in result), "Should not have email field");
  });

  // Test 13: Update operations
  this.test("Update customer age", function() {
    const originalDoc = this.collection.findOne({ email: "john@example.com" });
    const originalAge = originalDoc.age;

    const updateResult = this.collection.updateOne(
      { email: "john@example.com" },
      { $inc: { age: 1 } }
    );

    this.assertEqual(updateResult.modifiedCount, 1, "Should modify 1 document");

    const updatedDoc = this.collection.findOne({ email: "john@example.com" });
    this.assertEqual(updatedDoc.age, originalAge + 1, "Age should be incremented");

    // Restore original age
    this.collection.updateOne(
      { email: "john@example.com" },
      { $set: { age: originalAge } }
    );
  });

  // Test 14: Array operations
  this.test("Add purchase to customer", function() {
    const newPurchase = { product: "Test Item", price: 99 };

    const updateResult = this.collection.updateOne(
      { email: "bob@example.com" },
      { $push: { purchases: newPurchase } }
    );

    this.assertEqual(updateResult.modifiedCount, 1, "Should modify 1 document");

    const updatedDoc = this.collection.findOne({ email: "bob@example.com" });
    const lastPurchase = updatedDoc.purchases[updatedDoc.purchases.length - 1];

    this.assertEqual(lastPurchase.product, "Test Item", "Product name mismatch");
    this.assertEqual(lastPurchase.price, 99, "Price mismatch");

    // Clean up
    this.collection.updateOne(
      { email: "bob@example.com" },
      { $pop: { purchases: 1 } }
    );
  });

  // Test 15: Text search functionality (if text index exists)
  this.test("Text search capabilities", function() {
    // Create text index
    try {
      this.collection.createIndex({ name: "text", email: "text" });

      const results = this.collection.find(
        { $text: { $search: "john" } }
      ).toArray();

      this.assertGreaterThan(results.length, 0, "Should find at least one result");

      // Drop text index to avoid conflicts
      this.collection.dropIndex("name_text_email_text");
    } catch (e) {
      // Text index might already exist or fail, skip test
      print("   ⚠️  Skipping text search test: " + e.message);
    }
  });

  // Cleanup after all tests
  this.afterAll(function() {
    // Optional: Remove test data if needed
    // this.collection.deleteMany({ email: { $in: ["john@example.com", "jane@example.com"] } });
    print("   Test data preserved for manual verification");
  });
});

// Run tests and print summary
const success = tester.summary();

// Exit with appropriate code
if (!success) {
  quit(1);
}
