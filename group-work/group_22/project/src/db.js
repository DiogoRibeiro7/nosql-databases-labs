const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  throw new Error("MONGODB_URI and MONGODB_DB_NAME must be set in .env");
}

let client;

async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName);
}

async function closeDb() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { getDb, closeDb };
