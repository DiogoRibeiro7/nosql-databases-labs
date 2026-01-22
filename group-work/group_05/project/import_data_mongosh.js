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
      const filePath = path.join(__dirname, fileName); // Assuming file is in root/data based on your logs

      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${fileName}`);
        return;
      }

      console.log(`Reading ${fileName}...`);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Drop existing collection to start fresh
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

    // --- 1. Import Process ---
    // Make sure paths match where your files actually are.
    // Based on your error log, it seems they are in a 'data' subfolder.
    await loadAndInsert("hosts", "data/hosts.json");
    await loadAndInsert("listings", "data/listings.json");
    await loadAndInsert("reviews", "data/reviews.json");
    await loadAndInsert("reservations", "data/reservations.json");

    console.log("\n--- Creating Indexes ---");

    // --- Index Creation ---

    // ====================================================
    // COLLECTION: HOSTS
    // ====================================================

    // A. Primary Key / Foreign Key Target
    await db
      .collection("hosts")
      .createIndex({ id: 1 }, { unique: true, name: "idx_hosts_id_unique" });

    // B. Brand Analysis
    await db.collection("hosts").createIndex({ name: 1 }, { name: "idx_hosts_name" });

    // ====================================================
    // COLLECTION: LISTINGS
    // ====================================================

    // A. Primary Key
    await db
      .collection("listings")
      .createIndex({ id: 1 }, { unique: true, name: "idx_listings_id_unique" });

    // B. Foreign Key
    await db.collection("listings").createIndex({ host_id: 1 }, { name: "idx_listings_host_id" });

    // C. Geospatial + Scalar Filters (Compound Index)
    await db
      .collection("listings")
      .createIndex(
        { location: "2dsphere", room_type: 1, accommodates: 1 },
        { name: "idx_geo_hotel_capacity" }
      );

    // D. Rating Filter
    await db
      .collection("listings")
      .createIndex({ review_scores_rating: -1 }, { name: "idx_listings_rating" });

    // ====================================================
    // COLLECTION: REVIEWS
    // ====================================================

    // A. The "Perfect" Pipeline Index
    await db
      .collection("reviews")
      .createIndex(
        { listing_id: 1, rating: -1, date: -1 },
        { name: "idx_reviews_lookup_optimized" }
      );

    console.log("Indexes created successfully!");

    // Check indexes on listings
    const indexes = await db.collection("listings").indexes();
    console.log("\nCurrent Indexes on 'listings':");
    console.log(indexes);

    console.log("\nAll operations finished successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

importData();
