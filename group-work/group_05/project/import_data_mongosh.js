const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

async function importData() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");

    const db = client.db("airbnb");
    db.dropCollection("airbnb_data");
    const collection = db.collection("airbnb_data");

    // Helper function to read and parse JSON
    const getData = (fileName) => {
      const filePath = path.join(__dirname, "data", fileName);
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    };

    // Load both datasets
    const lisbonData = getData("sample_lisbon_listings.json");
    const portoData = getData("sample_porto_listings.json");

    // Combine arrays (using the spread operator)
    const combinedData = [...lisbonData, ...portoData];

    // Insert into mongodb
    const result = await collection.insertMany(combinedData);

    console.log(`${result.insertedCount} documents were inserted.`);
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await client.close();
  }
}

importData();
