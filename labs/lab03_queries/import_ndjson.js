/* eslint-env mongo */

// NDJSON import script for lab03_movies database
// Run this in mongosh: load("labs/lab03_queries/import_ndjson.js")

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
      return new Date(obj.$date);
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

// Function to import NDJSON file
function importNDJSON(collectionName, filename) {
  try {
    print(`\nImporting ${collectionName}...`);
    const fileContent = fs.readFileSync(filename, "utf8");

    // Split by newlines and filter empty lines
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    print(`  Found ${lines.length} lines in ${filename}`);

    let documents = [];
    let errorCount = 0;

    // Parse each line
    for (let i = 0; i < lines.length; i++) {
      try {
        const doc = JSON.parse(lines[i]);
        const converted = convertExtendedJSON(doc);
        documents.push(converted);
      } catch (e) {
        errorCount++;
        if (errorCount <= 5) {
          print(`  Warning: Failed to parse line ${i + 1}: ${e.message.substring(0, 100)}`);
        }
      }

      // Insert in batches
      if (documents.length >= 1000 || i === lines.length - 1) {
        if (documents.length > 0) {
          try {
            db[collectionName].insertMany(documents, { ordered: false });
          } catch (insertError) {
            print(`  Warning: Some documents failed to insert: ${insertError.message.substring(0, 100)}`);
          }
          print(`  Processed ${i + 1} / ${lines.length} lines...`);
          documents = [];
        }
      }
    }

    if (errorCount > 5) {
      print(`  Total parse errors: ${errorCount}`);
    }

    const count = db[collectionName].countDocuments();
    print(`  Successfully imported ${count} documents into ${collectionName}`);
    return true;

  } catch (error) {
    print(`  ERROR importing ${collectionName}: ${error.message}`);
    return false;
  }
}

// Function to import regular JSON array
function importJSON(collectionName, filename) {
  try {
    print(`\nImporting ${collectionName}...`);
    const jsonContent = fs.readFileSync(filename, "utf8");
    const data = JSON.parse(jsonContent);
    const converted = convertExtendedJSON(data);

    if (Array.isArray(converted) && converted.length > 0) {
      db[collectionName].insertMany(converted);
    }

    const count = db[collectionName].countDocuments();
    print(`  Successfully imported ${count} documents into ${collectionName}`);
    return true;

  } catch (error) {
    print(`  ERROR importing ${collectionName}: ${error.message}`);
    return false;
  }
}

// Try to detect format and import each collection
function smartImport(collectionName, filename) {
  try {
    // Check first character to determine format
    const content = fs.readFileSync(filename, "utf8");
    const firstChar = content.trim()[0];

    if (firstChar === '[') {
      // It's a JSON array
      print(`  Detected JSON array format for ${collectionName}`);
      return importJSON(collectionName, filename);
    } else if (firstChar === '{') {
      // It's likely NDJSON
      print(`  Detected NDJSON format for ${collectionName}`);
      return importNDJSON(collectionName, filename);
    } else {
      print(`  Unknown format for ${collectionName}`);
      return false;
    }
  } catch (error) {
    print(`  ERROR reading ${filename}: ${error.message}`);
    return false;
  }
}

// Import all collections
print("Starting import process...");

const collections = [
  { name: "movies", file: "labs/lab03_queries/starter/data/movies.json" },
  { name: "theaters", file: "labs/lab03_queries/starter/data/theaters.json" },
  { name: "users", file: "labs/lab03_queries/starter/data/users.json" },
  { name: "comments", file: "labs/lab03_queries/starter/data/comments.json" },
  { name: "sessions", file: "labs/lab03_queries/starter/data/sessions.json" }
];

let successCount = 0;
for (const col of collections) {
  if (smartImport(col.name, col.file)) {
    successCount++;
  }
}

print("\n========================================");
print("Database import complete!");
print(`Successfully imported ${successCount} / ${collections.length} collections`);
print("========================================");

print("\nFinal counts:");
print(`Movies: ${db.movies.countDocuments()}`);
print(`Theaters: ${db.theaters.countDocuments()}`);
print(`Users: ${db.users.countDocuments()}`);
print(`Comments: ${db.comments.countDocuments()}`);
print(`Sessions: ${db.sessions.countDocuments()}`);

// Show samples
if (db.movies.countDocuments() > 0) {
  print("\nSample movie:");
  const movie = db.movies.findOne({}, {title: 1, year: 1, genres: 1, plot: 1, _id: 0});
  printjson(movie);
}

if (db.users.countDocuments() > 0) {
  print("\nSample user:");
  const user = db.users.findOne({}, {username: 1, email: 1, _id: 0});
  printjson(user);
}

print("\n✓ Database ready! You can now run: load('labs/lab03_queries/queries.js')");
