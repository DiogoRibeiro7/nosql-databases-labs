// Lab 04 – Aggregation Dataset Importer
// Usage: node import_data.js

const { MongoClient } = require("mongodb");
const fs = require("fs").promises;
const path = require("path");

const DATASETS = [
  { collection: "sales", file: "sales.json" },
  { collection: "products", file: "products.json" },
  { collection: "customers", file: "customers.json" },
];

const DB_NAME = "lab04_analytics";
const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function hydrateRecord(collection, record) {
  const hydrated = { ...record };

  if (hydrated.date) {
    hydrated.date = new Date(hydrated.date);
  }

  if (collection === "sales") {
    hydrated.total_amount = Number(hydrated.total_amount);
    hydrated.cost = Number(hydrated.cost);
    hydrated.profit = Number(hydrated.profit);
    hydrated.quantity = Number(hydrated.quantity);
  }

  if (collection === "products") {
    hydrated.price = Number(hydrated.price);
    hydrated.cost = Number(hydrated.cost);
    hydrated.margin = Number(hydrated.margin);
  }

  return hydrated;
}

async function importCollection(db, datasetDir, { collection, file }) {
  const fullPath = path.join(datasetDir, file);
  const items = await readJson(fullPath);
  const hydrated = items.map((item) => hydrateRecord(collection, item));

  await db.collection(collection).deleteMany({});
  if (hydrated.length > 0) {
    await db.collection(collection).insertMany(hydrated);
  }

  console.log(`✓ Imported ${hydrated.length} documents into ${collection}`);
}

async function createIndexes(db) {
  await Promise.all([
    db.collection("sales").createIndexes([
      { key: { date: 1 }, name: "date_1" },
      { key: { customer_id: 1 }, name: "customer_id_1" },
      { key: { product_id: 1 }, name: "product_id_1" },
      { key: { date: 1, customer_id: 1 }, name: "date_customer" },
    ]),
    db.collection("products").createIndexes([
      { key: { product_id: 1 }, unique: true, name: "product_id_1" },
      { key: { category: 1 }, name: "category_1" },
      { key: { supplier: 1 }, name: "supplier_1" },
    ]),
    db.collection("customers").createIndexes([
      { key: { customer_id: 1 }, unique: true, name: "customer_id_1" },
      { key: { segment: 1 }, name: "segment_1" },
      { key: { country: 1 }, name: "country_1" },
    ]),
  ]);

  console.log("✓ Indexes created");
}

function handleConnectionError(error) {
  if (error?.name === "MongoServerSelectionError" || error?.message?.includes("ECONNREFUSED")) {
    console.error("\n⚠️ Unable to connect to MongoDB at", URI);
    console.error("   • Start mongod locally or set MONGODB_URI to a reachable server\n");
    return true;
  }
  return false;
}

async function main() {
  const datasetDir = path.join(__dirname, "starter", "data");
  const client = new MongoClient(URI);

  await client.connect();
  const db = client.db(DB_NAME);

  try {
    for (const dataset of DATASETS) {
      await importCollection(db, datasetDir, dataset);
    }

    await createIndexes(db);

    console.log("\nLab 04 dataset imported successfully.");
  } catch (error) {
    if (!handleConnectionError(error)) {
      console.error("Import failed:", error.message || error);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    if (!handleConnectionError(error)) {
      console.error(error);
    }
    process.exit(1);
  });
}

module.exports = { main };
