// Lab 01 - Data Import Script for mongosh
// This script can be run directly in mongosh to set up the database
// Run with: mongosh --file import_data.js

// Connect to the lab01_student database
db = db.getSiblingDB('lab01_student');

// Drop existing collection if it exists (optional)
db.customers.drop();

// Sample data to import
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

// Insert the sample data
print("Importing sample data...");
const result = db.customers.insertMany(customers);
print(`Successfully inserted ${result.insertedIds ? Object.keys(result.insertedIds).length : customers.length} documents`);

// Create indexes
print("\nCreating indexes...");

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
print("✓ Created unique index on email");

// Verify the import
print("\nVerifying import...");
const count = db.customers.countDocuments();
print(`Total documents in collection: ${count}`);

// Show sample data
print("\nSample data (first 3 documents):");
db.customers.find().limit(3).forEach(doc => {
  printjson(doc);
});

print("\n=================================");
print("Database setup completed!");
print("=================================");
print("\nYou can now run queries from queries.js or explore the data.");
print("To load queries.js, use: load('queries.js')");