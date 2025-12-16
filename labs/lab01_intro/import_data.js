// Lab 01 - Data Import Script for Node.js
// This script can be run with Node.js to set up the database
// Run with: node import_data.js

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'lab01_student';

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
    "city": "Berlin",
    "country": "Germany",
    "age": 29,
    "balance": 2500.00
  },
  {
    "customer_id": 6,
    "name": "Fiona Garcia",
    "email": "fiona.g@example.com",
    "city": "Madrid",
    "country": "Spain",
    "age": 33,
    "balance": 1950.75
  },
  {
    "customer_id": 7,
    "name": "George Wilson",
    "email": "george.wilson@example.com",
    "city": "Sydney",
    "country": "Australia",
    "age": 45,
    "balance": 4200.00
  },
  {
    "customer_id": 8,
    "name": "Hannah Lee",
    "email": "hannah.lee@example.com",
    "city": "Seoul",
    "country": "South Korea",
    "age": 27,
    "balance": 1600.50
  },
  {
    "customer_id": 9,
    "name": "Ian Taylor",
    "email": "ian.t@example.com",
    "city": "Toronto",
    "country": "Canada",
    "age": 38,
    "balance": 2800.25
  },
  {
    "customer_id": 10,
    "name": "Julia Martinez",
    "email": "julia.m@example.com",
    "city": "Mexico City",
    "country": "Mexico",
    "age": 30,
    "balance": 2200.00
  }
];

async function importData() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Get database reference
    const db = client.db(dbName);

    // Drop existing collection if it exists
    await db.collection('customers').drop().catch(() => {
      console.log('Collection does not exist, creating new one');
    });

    // Insert the data
    const result = await db.collection('customers').insertMany(customers);

    console.log(`Successfully inserted ${result.insertedCount} documents`);

    // Verify the import
    const count = await db.collection('customers').countDocuments();
    console.log(`Total documents in customers collection: ${count}`);

    // Show a sample document
    const sample = await db.collection('customers').findOne({});
    console.log('\nSample document:');
    console.log(JSON.stringify(sample, null, 2));

    console.log('\nDatabase setup complete!');
    console.log('You can now run queries against the lab01_student.customers collection');

  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the import
importData().catch(console.error);