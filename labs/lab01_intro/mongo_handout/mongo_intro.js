// mongo_intro.js
/**
 * Small script that:
 *  - connects to a local MongoDB server
 *  - lists databases and collections
 *  - runs a simple query on a 'books' collection
 */

import { MongoClient } from "mongodb";

/**
 * Create and return a connected MongoClient.
 *
 * @param {string} [uri="mongodb://localhost:27017"]
 *   MongoDB connection URI.
 * @returns {Promise<MongoClient>}
 *   Connected MongoClient.
 * @throws {TypeError}
 *   If URI is not a string.
 * @throws {Error}
 *   If connection fails.
 */
async function getMongoClient(uri = "mongodb://localhost:27017") {
  if (typeof uri !== "string") {
    throw new TypeError("MongoDB URI must be a string.");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  // Connect and ping to confirm.
  await client.connect();
  await client.db("admin").command({ ping: 1 });

  return client;
}

/**
 * List database names for exploration.
 *
 * @param {MongoClient} client
 * @returns {Promise<string[]>}
 */
async function listDatabases(client) {
  const adminDb = client.db().admin();
  const { databases } = await adminDb.listDatabases();
  return databases.map((db) => db.name);
}

/**
 * Get a collection from a database.
 *
 * @param {MongoClient} client
 * @param {string} dbName
 * @param {string} collectionName
 * @returns {import("mongodb").Collection}
 */
function getCollection(client, dbName, collectionName) {
  if (typeof dbName !== "string" || dbName.length === 0) {
    throw new TypeError("dbName must be a non-empty string.");
  }
  if (typeof collectionName !== "string" || collectionName.length === 0) {
    throw new TypeError("collectionName must be a non-empty string.");
  }

  const db = client.db(dbName);
  return db.collection(collectionName);
}

/**
 * List collection names in a database.
 *
 * @param {MongoClient} client
 * @param {string} dbName
 * @returns {Promise<string[]>}
 */
async function listCollections(client, dbName) {
  const db = client.db(dbName);
  const collections = await db.collections();
  return collections.map((c) => c.collectionName);
}

/**
 * Run example queries on the 'books' collection.
 *
 * @param {import("mongodb").Collection} collection
 * @returns {Promise<object[]>}
 */
async function findExampleDocuments(collection) {
  // 1) Find all documents:
  // const docs = await collection.find({}).toArray();

  // 2) Filter: books with more than 300 pages,
  //    sorted by pageCount descending, limited to 5 results.
  const docs = await collection
    .find({ pageCount: { $gt: 300 } })
    .sort({ pageCount: -1 })
    .limit(5)
    .toArray();

  return docs;
}

async function main() {
  let client;

  try {
    client = await getMongoClient();

    const dbNames = await listDatabases(client);
    console.log("Databases:", dbNames);

    const dbName = "library";
    const collectionName = "books";

    const collections = await listCollections(client, dbName);
    console.log(`Collections in '${dbName}':`, collections);

    const booksCollection = getCollection(client, dbName, collectionName);
    const docs = await findExampleDocuments(booksCollection);

    console.log("Example documents:");
    for (const doc of docs) {
      console.log(doc);
    }
  } catch (error) {
    console.error("Error while working with MongoDB:", error);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
