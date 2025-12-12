/**
 * Lab 02 - Data Import Script
 *
 * This script imports sample data for the e-commerce data model.
 * It creates the database, collections, and loads sample documents.
 */

const { MongoClient } = require("mongodb");
const fs = require("fs").promises;
const path = require("path");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Collection names
const COLLECTIONS = ["customers", "products", "orders", "reviews"];

/**
 * Read a JSON file from disk and parse it into JavaScript objects.
 *
 * @param {string} filePath - Absolute path to the JSON file.
 * @returns {Promise<object[]>} Parsed JSON contents.
 */
async function loadJSONFile (filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Main entry point that connects to MongoDB, loads all seed documents,
 * and ensures indexes are created for every collection in the model.
 *
 * @returns {Promise<void>}
 */
async function importData () {
  let client;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected successfully to MongoDB");

    // Get database reference
    const db = client.db(DATABASE_NAME);

    // Drop existing collections if they exist
    console.log(`\nSetting up database: ${DATABASE_NAME}`);
    for (const collectionName of COLLECTIONS) {
      try {
        await db.collection(collectionName).drop();
        console.log(`Dropped existing collection: ${collectionName}`);
      } catch (error) {
        // Collection might not exist, that's okay
        if (error.codeName !== "NamespaceNotFound") {
          console.log(`Note: ${collectionName} collection does not exist yet`);
        }
      }
    }

    // Import data for each collection
    console.log("\nImporting sample data...");
    // Source JSON sits inside the starter pack so instructors can tweak samples easily.
    const dataDir = path.join(__dirname, "starter", "data");

    for (const collectionName of COLLECTIONS) {
      const filePath = path.join(dataDir, `${collectionName}.json`);

      try {
        console.log(`\nImporting ${collectionName}...`);
        const documents = await loadJSONFile(filePath);

        if (!Array.isArray(documents) || documents.length === 0) {
          console.log(`Warning: No documents found in ${filePath}`);
          continue;
        }

        // Convert Extended JSON format if needed
        const processedDocs = documents.map(doc => {
          // Convert MongoDB Extended JSON format
          return JSON.parse(JSON.stringify(doc), (key, value) => {
            // Convert $oid to ObjectId
            if (value && value.$oid) {
              return value.$oid;
            }
            // Convert $date to Date
            if (value && value.$date) {
              return new Date(value.$date);
            }
            return value;
          });
        });

        const result = await db.collection(collectionName).insertMany(processedDocs);
        console.log(`✓ Imported ${result.insertedCount} documents into ${collectionName}`);
      } catch (error) {
        console.error(`Error importing ${collectionName}:`, error.message);
        throw error;
      }
    }

    // Create indexes
    console.log("\nCreating indexes...");
    await createIndexes(db);

    // Verify import
    console.log("\nVerifying data import...");
    // Print document counts so students can confirm dataset size matches expectations.
    for (const collectionName of COLLECTIONS) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`${collectionName}: ${count} documents`);
    }

    console.log("\n✓ Data import completed successfully!");
    console.log(`Database "${DATABASE_NAME}" is ready for use.`);
  } catch (error) {
    console.error("\nError during import:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

/**
 * Create the indexes required by the lab's query workload.
 *
 * @param {import("mongodb").Db} db - Active database handle.
 * @returns {Promise<void>}
 */
async function createIndexes (db) {
  try {
    // Customers collection indexes
    await db.collection("customers").createIndex({ customer_id: 1 }, { unique: true });
    await db.collection("customers").createIndex({ email: 1 }, { unique: true });
    console.log("✓ Created indexes for customers collection");

    // Products collection indexes
    await db.collection("products").createIndex({ product_id: 1 }, { unique: true });
    await db.collection("products").createIndex({ category: 1 });
    await db.collection("products").createIndex({ price: 1 });
    await db.collection("products").createIndex({ category: 1, price: 1 });
    await db
      .collection("products")
      .createIndex({ name: "text", description: "text" }, { name: "product_text_search" });
    console.log("✓ Created indexes for products collection");

    // Orders collection indexes
    await db.collection("orders").createIndex({ order_id: 1 }, { unique: true });
    await db.collection("orders").createIndex({ customer_id: 1 });
    await db.collection("orders").createIndex({ order_date: -1 });
    await db.collection("orders").createIndex({ customer_id: 1, order_date: -1 });
    await db.collection("orders").createIndex({ status: 1 });
    await db.collection("orders").createIndex({ "items.product_id": 1 });
    console.log("✓ Created indexes for orders collection");

    // Reviews collection indexes
    await db.collection("reviews").createIndex({ review_id: 1 }, { unique: true });
    await db.collection("reviews").createIndex({ product_id: 1 });
    await db.collection("reviews").createIndex({ customer_id: 1 });
    await db.collection("reviews").createIndex({ product_id: 1, created_at: -1 });
    await db.collection("reviews").createIndex({ rating: 1 });
    console.log("✓ Created indexes for reviews collection");
  } catch (error) {
    console.error("Error creating indexes:", error.message);
    throw error;
  }
}

// Run the import
if (require.main === module) {
  importData().catch(console.error);
}

module.exports = { importData, DATABASE_NAME };
