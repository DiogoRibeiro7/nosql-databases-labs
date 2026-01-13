#!/usr/bin/env node

/**
 * Lab 01 - Data Import Script
 *
 * This single file supports both execution contexts used in the course:
 *   1) Node.js 18+ (via `node import_data.js`)
 *   2) mongosh (via `mongosh --file import_data.js`)
 */

const dbName = "lab01_student";
const collectionName = "customers";

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
    city: "Berlin",
    country: "Germany",
    age: 29,
    balance: 2500.0,
  },
  {
    customer_id: 6,
    name: "Fiona Garcia",
    email: "fiona.g@example.com",
    city: "Madrid",
    country: "Spain",
    age: 33,
    balance: 1950.75,
  },
  {
    customer_id: 7,
    name: "George Wilson",
    email: "george.wilson@example.com",
    city: "Sydney",
    country: "Australia",
    age: 45,
    balance: 4200.0,
  },
  {
    customer_id: 8,
    name: "Hannah Lee",
    email: "hannah.lee@example.com",
    city: "Seoul",
    country: "South Korea",
    age: 27,
    balance: 1600.5,
  },
  {
    customer_id: 9,
    name: "Ian Taylor",
    email: "ian.t@example.com",
    city: "Toronto",
    country: "Canada",
    age: 38,
    balance: 2800.25,
  },
  {
    customer_id: 10,
    name: "Julia Martinez",
    email: "julia.m@example.com",
    city: "Mexico City",
    country: "Mexico",
    age: 30,
    balance: 2200.0,
  },
];

const isNodeRuntime = typeof process !== "undefined" && !!process.versions?.node;
const isMongoshRuntime = typeof db !== "undefined" && typeof db.getSiblingDB === "function";

async function importDataNode() {
  const { MongoClient } = require("mongodb");

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    await db
      .collection(collectionName)
      .drop()
      .catch(() => {
        console.log("Collection does not exist, creating new one");
      });

    const result = await db.collection(collectionName).insertMany(customers);
    console.log(`Successfully inserted ${result.insertedCount} documents`);

    const count = await db.collection(collectionName).countDocuments();
    console.log(`Total documents in ${collectionName} collection: ${count}`);

    const sample = await db.collection(collectionName).findOne({});
    console.log("\nSample document:");
    console.log(JSON.stringify(sample, null, 2));

    console.log("\nDatabase setup complete!");
    console.log(`You can now run queries against ${dbName}.${collectionName}`);
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

function importDataMongosh() {
  const log = typeof console !== "undefined" ? console.log : print;
  log("Connected to MongoDB via mongosh");

  const targetDb = db.getSiblingDB(dbName);
  const targetCollection = targetDb.getCollection(collectionName);

  try {
    const dropResult = targetCollection.drop();
    if (dropResult) {
      log(`Dropped existing ${collectionName} collection`);
    }
  } catch (error) {
    if (error.codeName !== "NamespaceNotFound") {
      throw error;
    }
    log("Collection does not exist, skipping drop");
  }

  const insertResult = targetCollection.insertMany(customers, { ordered: true });
  log(`Successfully inserted ${insertResult.insertedIds.length} documents`);

  const sample = targetCollection.findOne({});
  log("\nSample document:");
  if (typeof printjson === "function") {
    printjson(sample);
  } else {
    log(JSON.stringify(sample, null, 2));
  }

  const count = targetCollection.countDocuments();
  log(`Total documents in ${collectionName}: ${count}`);
  log("Database setup complete! You can now run queries via mongosh.");
}

if (isNodeRuntime) {
  importDataNode().catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  });
} else if (isMongoshRuntime) {
  importDataMongosh();
} else {
  throw new Error("Unsupported runtime. Run this script with Node.js or mongosh.");
}
