// Reset Database Script for Lab 01
// This script clears and reinitializes the database with fresh data
// Run with: mongosh --file reset_database.js

// Connect to the lab01_student database
db = db.getSiblingDB('lab01_student');

print("=================================");
print("Resetting Lab 01 Database");
print("=================================\n");

// Drop the existing collection
print("Dropping existing customers collection...");
db.customers.drop();
print("✓ Collection dropped\n");

// Re-insert the initial sample data
print("Inserting fresh sample data...");
const customers = [
  {
    "customer_id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "city": "New York",
    "country": "USA",
    "age": 28,
    "balance": 1250.50
  },
  {
    "customer_id": 2,
    "name": "Bob Smith",
    "email": "bob.smith@example.com",
    "city": "London",
    "country": "UK",
    "age": 35,
    "balance": 2100.00
  },
  {
    "customer_id": 3,
    "name": "Charlie Davis",
    "email": "charlie.d@example.com",
    "city": "Paris",
    "country": "France",
    "age": 42,
    "balance": 3200.75
  },
  {
    "customer_id": 4,
    "name": "Diana Chen",
    "email": "diana.chen@example.com",
    "city": "Tokyo",
    "country": "Japan",
    "age": 31,
    "balance": 1800.25
  },
  {
    "customer_id": 5,
    "name": "Edward Brown",
    "email": "ed.brown@example.com",
    "city": "Sydney",
    "country": "Australia",
    "age": 29,
    "balance": 2500.00
  }
];

const result = db.customers.insertMany(customers);
print(`✓ Inserted ${result.insertedIds ? Object.keys(result.insertedIds).length : customers.length} documents\n`);

// Re-create indexes
print("Creating indexes...");

// Index on city
db.customers.createIndex({ city: 1 });
print("✓ Created index on city");

// Index on country
db.customers.createIndex({ country: 1 });
print("✓ Created index on country");

// Compound index on age and balance
db.customers.createIndex({ age: 1, balance: -1 });
print("✓ Created compound index on age and balance");

// Unique index on email
db.customers.createIndex({ email: 1 }, { unique: true });
print("✓ Created unique index on email\n");

// Verify the reset
const count = db.customers.countDocuments();
print("=================================");
print("Database reset completed!");
print("=================================");
print(`Total documents: ${count}`);
print("\nYou can now run queries.js without errors:");
print("  mongosh --file queries.js");
print("\nOr in interactive mode:");
print("  mongosh");
print("  use lab01_student");
print("  load('queries.js')");
