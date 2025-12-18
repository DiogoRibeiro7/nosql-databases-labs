// Reset Database Script for Lab 01 (Node.js)
// This script clears and reinitializes the database with fresh data
//
// Run with:
//   node reset_database.js
//
// Env (optional):
//   MONGODB_URI=mongodb://localhost:27017

"use strict";

const { MongoClient } = require("mongodb");

/** @type {string} */
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
/** @type {string} */
const DB_NAME = "lab01_student";
/** @type {string} */
const COLLECTION = "customers";

/** @type {Array<Record<string, unknown>>} */
const customers = [
  {
    customer_id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    city: "New York",
    country: "USA",
    age: 28,
    balance: 1250.5,
  },
  {
    customer_id: 2,
    name: "Bob Smith",
    email: "bob.smith@example.com",
    city: "London",
    country: "UK",
    age: 35,
    balance: 2100.0,
  },
  {
    customer_id: 3,
    name: "Charlie Davis",
    email: "charlie.d@example.com",
    city: "Paris",
    country: "France",
    age: 42,
    balance: 3200.75,
  },
  {
    customer_id: 4,
    name: "Diana Chen",
    email: "diana.chen@example.com",
    city: "Tokyo",
    country: "Japan",
    age: 31,
    balance: 1800.25,
  },
  {
    customer_id: 5,
    name: "Edward Brown",
    email: "ed.brown@example.com",
    city: "Sydney",
    country: "Australia",
    age: 29,
    balance: 2500.0,
  },
];

/**
 * A small runtime validator so a broken dataset fails fast.
 * @param {unknown[]} rows
 */
function assertCustomers(rows) {
  if (!Array.isArray(rows)) throw new TypeError("customers must be an array");
  for (const [i, row] of rows.entries()) {
    if (row === null || typeof row !== "object") {
      throw new TypeError(`customers[${i}] must be an object`);
    }
    /** @type {any} */
    const r = row;
    if (typeof r.customer_id !== "number")
      throw new TypeError(`customers[${i}].customer_id must be number`);
    if (typeof r.name !== "string") throw new TypeError(`customers[${i}].name must be string`);
    if (typeof r.email !== "string") throw new TypeError(`customers[${i}].email must be string`);
    if (typeof r.city !== "string") throw new TypeError(`customers[${i}].city must be string`);
    if (typeof r.country !== "string")
      throw new TypeError(`customers[${i}].country must be string`);
    if (typeof r.age !== "number") throw new TypeError(`customers[${i}].age must be number`);
    if (typeof r.balance !== "number")
      throw new TypeError(`customers[${i}].balance must be number`);
  }
}

/**
 * Reset the lab01_student.customers collection.
 */
async function main() {
  assertCustomers(customers);

  const client = new MongoClient(MONGODB_URI);

  console.log("=================================");
  console.log("Resetting Lab 01 Database");
  console.log("=================================\n");
  console.log(`MongoDB URI: ${MONGODB_URI}`);
  console.log(`Database:    ${DB_NAME}`);
  console.log(`Collection:  ${COLLECTION}\n`);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    // Drop collection if it exists (drop() throws if missing)
    console.log("Dropping existing customers collection...");
    const existing = await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray();
    if (existing.length > 0) {
      await col.drop();
      console.log("✓ Collection dropped\n");
    } else {
      console.log("✓ Collection did not exist (nothing to drop)\n");
    }

    // Re-create collection by inserting data
    console.log("Inserting fresh sample data...");
    const insertResult = await col.insertMany(customers, { ordered: true });
    const insertedCount =
      typeof insertResult?.insertedCount === "number"
        ? insertResult.insertedCount
        : Object.keys(insertResult.insertedIds ?? {}).length;

    console.log(`✓ Inserted ${insertedCount} documents\n`);

    // Re-create indexes
    console.log("Creating indexes...");

    await col.createIndex({ city: 1 }, { name: "city_1" });
    console.log("✓ Created index on city");

    await col.createIndex({ country: 1 }, { name: "country_1" });
    console.log("✓ Created index on country");

    await col.createIndex({ age: 1, balance: -1 }, { name: "age_1_balance_-1" });
    console.log("✓ Created compound index on age and balance");

    await col.createIndex({ email: 1 }, { name: "email_1", unique: true });
    console.log("✓ Created unique index on email\n");

    const count = await col.countDocuments();

    console.log("=================================");
    console.log("Database reset completed!");
    console.log("=================================");
    console.log(`Total documents: ${count}`);
    console.log("\nYou can now run queries.js without errors:");
    console.log("  mongosh --file queries.js");
    console.log("\nOr in interactive mode:");
    console.log("  mongosh");
    console.log("  use lab01_student");
    console.log("  load('queries.js')");
  } catch (err) {
    console.error("\nReset failed:");
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
