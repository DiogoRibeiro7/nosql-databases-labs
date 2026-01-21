const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

async function importData() {
  // Connection URI
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");

    const db = client.db("airbnb");

    // Helper function to load JSON file and insert into a specific collection
    const loadAndInsert = async (collectionName, fileName) => {
      // Read the file
      const filePath = path.join(__dirname, fileName); 
      
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${fileName}`);
        return;
      }

      console.log(`Reading ${fileName}...`);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Drop existing collection to start fresh (optional, but good for testing)
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        await db.collection(collectionName).drop();
        console.log(`Dropped existing collection: ${collectionName}`);
      }

      // Insert Data
      const collection = db.collection(collectionName);
      if (data.length > 0) {
        const result = await collection.insertMany(data);
        console.log(`Inserted ${result.insertedCount} documents into '${collectionName}'`);
      } else {
        console.log(`No data found in ${fileName}, skipping insertion.`);
      }
    };

    // --- Import Process ---
    // We await them one by one to keep the console logs readable
    await loadAndInsert("hosts", "data/hosts.json");
    await loadAndInsert("listings", "data/listings.json");
    await loadAndInsert("reviews", "data/reviews.json");

    console.log("\nAll imports finished successfully!");

  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

importData();