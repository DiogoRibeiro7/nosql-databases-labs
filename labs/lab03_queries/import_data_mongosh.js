// Robust import script for lab03_movies database
// Run this in mongosh: load("labs/lab03_queries/import_data_robust.js")

const fs = require("fs");

print("Setting up lab03_movies database...\n");

// Switch to lab03_movies database
db = db.getSiblingDB("lab03_movies");

// Clear existing collections if any
print("Clearing existing collections...");
db.movies.drop();
db.theaters.drop();
db.users.drop();
db.comments.drop();
db.sessions.drop();

// Helper function to convert Extended JSON to regular MongoDB objects
function convertExtendedJSON(obj) {
  if (obj === null || obj === undefined) return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertExtendedJSON(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    // Convert $oid to ObjectId
    if (obj.$oid) {
      return ObjectId(obj.$oid);
    }

    // Convert $date to Date
    if (obj.$date) {
      // Handle both string dates and nested $numberLong dates
      if (typeof obj.$date === 'string') {
        return new Date(obj.$date);
      } else if (obj.$date.$numberLong) {
        return new Date(parseInt(obj.$date.$numberLong));
      }
    }

    // Convert $numberInt
    if (obj.$numberInt) {
      return parseInt(obj.$numberInt);
    }

    // Convert $numberLong
    if (obj.$numberLong) {
      return NumberLong(obj.$numberLong);
    }

    // Convert $numberDouble
    if (obj.$numberDouble) {
      return parseFloat(obj.$numberDouble);
    }

    // Recursively convert nested objects
    const converted = {};
    for (let key in obj) {
      converted[key] = convertExtendedJSON(obj[key]);
    }
    return converted;
  }

  return obj;
}

// Function to import a collection with error handling
function importCollection(collectionName, filename) {
  try {
    print(`\nImporting ${collectionName}...`);
    const jsonContent = fs.readFileSync(filename, "utf8");

    let data;

    // Try to parse as JSON array first
    try {
      data = JSON.parse(jsonContent);
    } catch (e) {
      print(`  JSON parse failed for ${collectionName}: ${e.message}`);
      // If that fails, try to parse as NDJSON (newline-delimited JSON)
      print(`  Trying NDJSON format for ${collectionName}...`);
      const lines = jsonContent.split('\n').filter(line => line.trim());
      data = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (lineError) {
          print(`  Warning: Skipping invalid line in ${collectionName}: ${lineError.message}`);
          return null;
        }
      }).filter(item => item !== null);
    }

    if (!Array.isArray(data)) {
      data = [data]; // Wrap single object in array
    }

    // Convert Extended JSON format
    const converted = convertExtendedJSON(data);

    // Insert in batches for large collections
    const batchSize = 1000;
    let totalInserted = 0;

    for (let i = 0; i < converted.length; i += batchSize) {
      const batch = converted.slice(i, Math.min(i + batchSize, converted.length));
      try {
        const result = db[collectionName].insertMany(batch, { ordered: false });
        totalInserted += result.insertedCount;
      } catch (insertError) {
        print(`  Warning: Some documents in ${collectionName} batch ${Math.floor(i/batchSize) + 1} failed to insert`);
        print(`  Error: ${insertError.message}`);
        // Continue with next batch
      }

      if ((i + batchSize) % 5000 === 0 || i + batchSize >= converted.length) {
        print(`  Processed ${Math.min(i + batchSize, converted.length)} / ${converted.length} documents...`);
      }
    }

    const count = db[collectionName].countDocuments();
    print(`  Successfully imported ${count} documents into ${collectionName}`);
    if (totalInserted !== count) {
        print(`  Insert attempts acknowledged: ${totalInserted}`);
    }
    return true;

  } catch (error) {
    print(`  ERROR importing ${collectionName}: ${error.message}`);
    return false;
  }
}

// Import all collections
const collections = [
  { name: "movies", file: "labs/lab03_queries/starter/data/movies.json" },
  { name: "theaters", file: "labs/lab03_queries/starter/data/theaters.json" },
  { name: "users", file: "labs/lab03_queries/starter/data/users.json" },
  { name: "comments", file: "labs/lab03_queries/starter/data/comments.json" },
  { name: "sessions", file: "labs/lab03_queries/starter/data/sessions.json" }
];

let successCount = 0;
for (const col of collections) {
  if (importCollection(col.name, col.file)) {
    successCount++;
  }
}

print("\n========================================");
print("Database setup complete!");
print(`Successfully imported ${successCount} / ${collections.length} collections`);
print("========================================");

print("\nVerifying data:");
print(`Movies: ${db.movies.countDocuments()}`);
print(`Theaters: ${db.theaters.countDocuments()}`);
print(`Users: ${db.users.countDocuments()}`);
print(`Comments: ${db.comments.countDocuments()}`);
print(`Sessions: ${db.sessions.countDocuments()}`);

// Show sample documents if available
if (db.movies.countDocuments() > 0) {
  print("\nSample movie:");
  printjson(db.movies.findOne({}, {title: 1, year: 1, genres: 1, _id: 0}));
}

if (db.comments.countDocuments() > 0) {
  print("\nSample comment:");
  printjson(db.comments.findOne({}, {name: 1, email: 1, text: 1, _id: 0}));
}

print("\nYou can now run: load('labs/lab03_queries/queries.js')");
