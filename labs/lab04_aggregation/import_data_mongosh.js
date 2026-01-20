/* global cat */

// Lab 04 – Aggregation Dataset Importer (mongosh)
// Usage:
//   mongosh "mongodb://localhost:27017" --file labs/lab04_aggregation/import_data_mongosh.js
//
// Expects dataset JSON files at:
//   labs/lab04_aggregation/starter/data/{sales.json,products.json,customers.json}

"use strict";

/**
 * Configuration
 */
var DB_NAME = "lab04_analytics";
var DATASET_DIR =
  typeof __dirname !== "undefined"
    ? __dirname + "/starter/data"
    : "labs/lab04_aggregation/starter/data";

var DATASETS = [
  { collection: "sales", file: "sales.json" },
  { collection: "products", file: "products.json" },
  { collection: "customers", file: "customers.json" },
];

/**
 * Helpers
 */
function joinPath(a, b) {
  if (a.endsWith("/")) return a + b;
  return a + "/" + b;
}

function readJsonArray(filePath) {
  // mongosh provides cat() to read files from local FS
  var raw = cat(filePath);
  var parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Expected JSON array in " + filePath);
  }
  return parsed;
}

function toNumberOrNull(x) {
  if (x === null || x === undefined || x === "") return null;
  var n = Number(x);
  if (Number.isNaN(n)) return null;
  return n;
}

function hydrateRecord(collection, record) {
  // shallow copy
  var hydrated = Object.assign({}, record);

  // hydrate common date
  if (hydrated.date) {
    hydrated.date = new Date(hydrated.date);
  }

  if (collection === "sales") {
    // keep same fields you used in Node importer
    if ("total_amount" in hydrated) hydrated.total_amount = toNumberOrNull(hydrated.total_amount);
    if ("cost" in hydrated) hydrated.cost = toNumberOrNull(hydrated.cost);
    if ("profit" in hydrated) hydrated.profit = toNumberOrNull(hydrated.profit);
    if ("quantity" in hydrated) hydrated.quantity = toNumberOrNull(hydrated.quantity);

    // IMPORTANT: your aggregations use `amount` a lot.
    // If sales.json stores amount as a string, hydrate it too.
    if ("amount" in hydrated) hydrated.amount = toNumberOrNull(hydrated.amount);
  }

  if (collection === "products") {
    if ("price" in hydrated) hydrated.price = toNumberOrNull(hydrated.price);
    if ("cost" in hydrated) hydrated.cost = toNumberOrNull(hydrated.cost);
    if ("margin" in hydrated) hydrated.margin = toNumberOrNull(hydrated.margin);

    // Optional: stock quantity often appears in later scripts
    if ("stock_quantity" in hydrated)
      hydrated.stock_quantity = toNumberOrNull(hydrated.stock_quantity);
  }

  return hydrated;
}

function importCollection(dbase, datasetDir, dataset) {
  var collection = dataset.collection;
  var file = dataset.file;

  var fullPath = joinPath(datasetDir, file);
  var items = readJsonArray(fullPath);

  var hydrated = items.map(function (item) {
    return hydrateRecord(collection, item);
  });

  dbase.getCollection(collection).deleteMany({});
  if (hydrated.length > 0) {
    dbase.getCollection(collection).insertMany(hydrated, { ordered: false });
  }

  print("✓ Imported " + hydrated.length + " documents into " + collection);
}

function createIndexes(dbase) {
  // sales
  dbase.sales.createIndexes([
    { key: { date: 1 }, name: "date_1" },
    { key: { customer_id: 1 }, name: "customer_id_1" },
    { key: { product_id: 1 }, name: "product_id_1" },
    { key: { date: 1, customer_id: 1 }, name: "date_customer" },
  ]);

  // products
  dbase.products.createIndexes([
    { key: { product_id: 1 }, unique: true, name: "product_id_1" },
    { key: { category: 1 }, name: "category_1" },
    { key: { supplier: 1 }, name: "supplier_1" },
  ]);

  // customers
  dbase.customers.createIndexes([
    { key: { customer_id: 1 }, unique: true, name: "customer_id_1" },
    { key: { segment: 1 }, name: "segment_1" },
    { key: { country: 1 }, name: "country_1" },
  ]);

  print("✓ Indexes created");
}

/**
 * Main
 */
(function main() {
  try {
    use(DB_NAME);
    print("Connected to MongoDB (mongosh)");
    print("DB = " + db.getName());
    print("Dataset dir = " + DATASET_DIR);

    DATASETS.forEach(function (dataset) {
      importCollection(db, DATASET_DIR, dataset);
    });

    createIndexes(db);

    print("\nLab 04 dataset imported successfully.");
  } catch (err) {
    print("\nImport failed: " + (err && err.message ? err.message : String(err)));
    throw err; // make mongosh exit non-zero
  }
})();
