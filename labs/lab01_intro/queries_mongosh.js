// Lab 01 - MongoDB Queries
// Database: lab01_student
// Collection: customers
//
// This file is compatible with mongosh (MongoDB Shell)
// To run: mongosh lab01_student --file queries.js
// Or load interactively: mongosh, then use lab01_student, then load('queries.js')
//
// NOTE: If you get duplicate key errors, the data already exists.
// To reset the database, run: mongosh --file reset_database.js

db = db.getSiblingDB("lab01_student")

// ========================================
// 1. INSERT OPERATIONS
// ========================================

// Insert 3 additional customers (skip if they already exist)
print("Attempting to insert additional customers...");
try {
  // ordered:false keeps inserting remaining docs even if one violates the unique email index.
  db.customers.insertMany([
    {
      customer_id: 6,
      name: "Frank Miller",
      email: "frank.miller@example.com",
      city: "Toronto",
      country: "Canada",
      age: 45,
      balance: 4200.30
    },
    {
      customer_id: 7,
      name: "Grace Lee",
      email: "grace.lee@example.com",
      city: "Seoul",
      country: "South Korea",
      age: 26,
      balance: 1800.90
    },
    {
      customer_id: 8,
      name: "Henry Davis",
      email: "henry.davis@example.com",
      city: "New York",
      country: "USA",
      age: 38,
      balance: 3100.45
    }
  ], { ordered: false });  // Continue inserting even if some fail
  print("✓ Successfully inserted new customers");
} catch (e) {
  if (e.code === 11000) {
    print("✓ Some customers already exist (skipping duplicates)");
  } else {
    print("Error inserting customers: " + e.message);
  }
}

// ========================================
// 2. BASIC QUERIES
// ========================================

// 2.1. Find ALL customers
db.customers.find();

// 2.2. Find ALL customers (formatted output)
db.customers.find().pretty();

// 2.3. Find customers from a specific city (e.g., "New York")
db.customers.find({ city: "New York" });

// 2.4. Find customers from a specific city with projection (only name and email)
db.customers.find(
  { city: "New York" },
  { name: 1, email: 1, city: 1, _id: 0 }
);

// 2.5. Find customers whose age is greater than 30
db.customers.find({ age: { $gt: 30 } });

// 2.6. Find customers whose age is greater than 30 (formatted)
db.customers.find(
  { age: { $gt: 30 } },
  { name: 1, age: 1, city: 1, _id: 0 }
).sort({ age: 1 });

// 2.7. Find customers whose balance is greater than 2000
db.customers.find({ balance: { $gt: 2000 } });

// 2.8. Find customers from USA or UK
db.customers.find({
  country: { $in: ["USA", "UK"] }
});

// ========================================
// 3. UPDATE OPERATIONS
// ========================================

// 3.1. Update a single customer's balance
db.customers.updateOne(
  { customer_id: 1 },
  { $set: { balance: 1500.00 } }
);

// 3.2. Update multiple customers - increase balance by 10% for age > 30
db.customers.updateMany(
  { age: { $gt: 30 } },
  // $mul applies percentage increase without needing a client-side loop.
  { $mul: { balance: 1.1 } }
);

// 3.3. Add a new field to a customer
db.customers.updateOne(
  { customer_id: 2 },
  { $set: { membership: "premium", join_date: new Date("2024-01-15") } }
);

// ========================================
// 4. AGGREGATIONS
// ========================================

// 4.1. Count total number of customers
db.customers.countDocuments();

// 4.2. Count customers per country
db.customers.aggregate([
  // $group by country is enough to answer the "customers per country" task.
  {
    $group: {
      _id: "$country",
      count: { $sum: 1 }
    }
  },
  // Sorting puts the biggest customer bases first.
  {
    $sort: { count: -1 }
  }
]);

// 4.3. Compute the average age of all customers
db.customers.aggregate([
  {
    $group: {
      _id: null,
      averageAge: { $avg: "$age" }
    }
  }
]);

// 4.4. Compute the average balance of all customers
db.customers.aggregate([
  {
    $group: {
      _id: null,
      // Combine several metrics in one pass to demonstrate accumulator variety.
      averageBalance: { $avg: "$balance" },
      totalBalance: { $sum: "$balance" },
      minBalance: { $min: "$balance" },
      maxBalance: { $max: "$balance" }
    }
  }
]);

// 4.5. Get statistics per country (count, avg age, avg balance)
db.customers.aggregate([
  {
    $group: {
      _id: "$country",
      // Combine per-country stats to support multiple dashboard-style answers.
      customerCount: { $sum: 1 },
      avgAge: { $avg: "$age" },
      avgBalance: { $avg: "$balance" },
      totalBalance: { $sum: "$balance" }
    }
  },
  {
    $sort: { totalBalance: -1 }
  }
]);

// 4.6. Find customers by age group
db.customers.aggregate([
  {
    $bucket: {
      // Bucketing creates pseudo age ranges so the distribution is easy to read.
      groupBy: "$age",
      boundaries: [20, 30, 40, 50],
      default: "50+",
      output: {
        count: { $sum: 1 },
        customers: { $push: "$name" },
        avgBalance: { $avg: "$balance" }
      }
    }
  }
]);

// ========================================
// 5. DELETE OPERATIONS
// ========================================

// 5.1. Delete a single customer by ID (use with caution)
// db.customers.deleteOne({ customer_id: 999 });

// 5.2. Delete customers with balance less than 100 (use with caution)
// db.customers.deleteMany({ balance: { $lt: 100 } });

// ========================================
// 6. INDEXES
// ========================================

// 6.1. Create index on city (for faster city-based queries)
db.customers.createIndex({ city: 1 });

// 6.2. Create index on country (for faster country-based aggregations)
db.customers.createIndex({ country: 1 });

// 6.3. Create compound index on age and balance
db.customers.createIndex({ age: 1, balance: -1 });

// 6.4. Create index on email (unique)
db.customers.createIndex({ email: 1 }, { unique: true });

// 6.5. List all indexes on the collection
db.customers.getIndexes();

// 6.6. Explain query execution plan (to see if index is used)
db.customers.find({ city: "New York" }).explain("executionStats");

// 6.7. Explain aggregation execution plan
db.customers.aggregate([
  { $match: { country: "USA" } },
  { $group: { _id: "$city", count: { $sum: 1 } } }
]).explain("executionStats");

// ========================================
// 7. ADVANCED QUERIES
// ========================================

// 7.1. Find customers sorted by balance (descending)
db.customers.find().sort({ balance: -1 });

// 7.2. Find top 3 customers by balance
db.customers.find().sort({ balance: -1 }).limit(3);

// 7.3. Find customers with pagination (skip 2, limit 3)
db.customers.find().skip(2).limit(3);

// 7.4. Count customers by city
db.customers.aggregate([
  {
    $group: {
      _id: "$city",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
]);

// 7.5. Find customers with name containing "John"
db.customers.find({ name: { $regex: /John/i } });

// 7.6. Find customers aged between 25 and 35
db.customers.find({
  age: { $gte: 25, $lte: 35 }
});

// ========================================
// 8. DATA EXPORT/IMPORT COMMANDS
// ========================================

// These commands are run in the shell, not in the MongoDB shell:

// Export collection to JSON
// mongoexport --db lab01_student --collection customers --out customers_export.json --jsonArray

// Import collection from JSON
// mongoimport --db lab01_student --collection customers --file sample.json --jsonArray

// Backup database
// mongodump --db lab01_student --out ./backup

// Restore database
// mongorestore --db lab01_student ./backup/lab01_student
