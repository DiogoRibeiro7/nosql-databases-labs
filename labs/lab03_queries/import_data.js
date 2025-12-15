// Robust import script for lab03_movies database
// Run this with Node.js: node import_data.js

const { MongoClient, ObjectId, Long } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'lab03_movies';
const args = process.argv.slice(2);
const globalLimit = (() => {
  const flag = args.find(arg => arg.startsWith('--limit='));
  if (flag) return parseLimit(flag.split('=')[1]);
  const flagIndex = args.indexOf('--limit');
  if (flagIndex !== -1 && args[flagIndex + 1]) {
    return parseLimit(args[flagIndex + 1]);
  }
  return parseLimit(process.env.LAB03_IMPORT_LIMIT);
})();

function handleConnectionError(error) {
  if (
    error?.name === 'MongoServerSelectionError' ||
    error?.message?.includes('ECONNREFUSED')
  ) {
    console.error('\n⚠️ Unable to connect to MongoDB at', uri);
    console.error('   • Start mongod locally or update MONGODB_URI');
    console.error('   • For Docker setups, ensure the MongoDB container is running\n');
    return true;
  }
  return false;
}

function parseLimit(value) {
  if (value === undefined || value === null || value === '') return null;
  const limit = parseInt(value, 10);
  if (!Number.isFinite(limit) || limit <= 0) {
    return null;
  }
  return limit;
}

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
      return new ObjectId(obj.$oid);
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
      return Long.fromString(obj.$numberLong);
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
async function importCollection(db, collectionName, filename, maxDocs) {
  try {
    console.log(`\nImporting ${collectionName}...`);
    const jsonContent = await fs.readFile(filename, 'utf8');

    let data;

    // Try to parse as JSON array first
    try {
      data = JSON.parse(jsonContent);
    } catch (e) {
      console.log(`  JSON parse failed for ${collectionName}: ${e.message}`);
      // If that fails, try to parse as NDJSON (newline-delimited JSON)
      console.log(`  Trying NDJSON format for ${collectionName}...`);
      const lines = jsonContent.split('\n').filter(line => line.trim());
      data = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (lineError) {
          console.log(`  Warning: Skipping invalid line in ${collectionName}: ${lineError.message}`);
          return null;
        }
      }).filter(item => item !== null);
    }

    if (!Array.isArray(data)) {
      data = [data]; // Wrap single object in array
    }

    // Convert Extended JSON format
    const converted = convertExtendedJSON(data);
    let documents = converted;

    if (maxDocs && maxDocs > 0 && converted.length > maxDocs) {
      documents = converted.slice(0, maxDocs);
      console.log(`  Limiting to ${maxDocs} documents (of ${converted.length}) for ${collectionName}`);
    }

    // Drop existing collection
    await db.collection(collectionName).drop().catch(() => {});

    // Insert in batches for large collections
    const batchSize = 1000;
    let totalInserted = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, Math.min(i + batchSize, documents.length));
      try {
        const result = await db.collection(collectionName).insertMany(batch, { ordered: false });
        totalInserted += result.insertedCount;
      } catch (insertError) {
        console.log(`  Warning: Some documents in ${collectionName} batch ${Math.floor(i/batchSize) + 1} failed to insert`);
        console.log(`  Error: ${insertError.message}`);
        // Continue with next batch
      }

      if ((i + batchSize) % 5000 === 0 || i + batchSize >= documents.length) {
        console.log(`  Processed ${Math.min(i + batchSize, documents.length)} / ${documents.length} documents...`);
      }
    }

    const count = await db.collection(collectionName).countDocuments();
    console.log(`  Successfully imported ${count} documents into ${collectionName}`);
    if (totalInserted !== count) {
      console.log(`  Insert attempts acknowledged: ${totalInserted}`);
    }
    return true;

  } catch (error) {
    console.log(`  ERROR importing ${collectionName}: ${error.message}`);
    return false;
  }
}

async function main() {
  const client = new MongoClient(uri);

  try {
    console.log("Setting up lab03_movies database...\n");

    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    console.log("Clearing existing collections...");

    // Import all collections
    const resolveLimit = (name) => {
      const normalized = name.toUpperCase();
      const envValue = process.env[`LAB03_LIMIT_${normalized}`];
      const cliFlag = args.find(arg => arg.startsWith(`--limit-${name.toLowerCase()}=`));
      if (cliFlag) {
        return parseLimit(cliFlag.split('=')[1]);
      }
      const cliIndex = args.indexOf(`--limit-${name.toLowerCase()}`);
      if (cliIndex !== -1 && args[cliIndex + 1]) {
        return parseLimit(args[cliIndex + 1]);
      }

      const envLimit = parseLimit(envValue);
      return envLimit ?? globalLimit;
    };

    const collections = [
      { name: "movies", file: path.join(__dirname, "starter/data/movies.json") },
      { name: "theaters", file: path.join(__dirname, "starter/data/theaters.json") },
      { name: "users", file: path.join(__dirname, "starter/data/users.json") },
      { name: "comments", file: path.join(__dirname, "starter/data/comments.json") },
      { name: "sessions", file: path.join(__dirname, "starter/data/sessions.json") }
    ];

    let successCount = 0;
    for (const col of collections) {
      if (await importCollection(db, col.name, col.file, resolveLimit(col.name))) {
        successCount++;
      }
    }

    console.log("\n========================================");
    console.log("Database setup complete!");
    console.log(`Successfully imported ${successCount} / ${collections.length} collections`);
    console.log("========================================");

    console.log("\nVerifying data:");
    console.log(`Movies: ${await db.collection('movies').countDocuments()}`);
    console.log(`Theaters: ${await db.collection('theaters').countDocuments()}`);
    console.log(`Users: ${await db.collection('users').countDocuments()}`);
    console.log(`Comments: ${await db.collection('comments').countDocuments()}`);
    console.log(`Sessions: ${await db.collection('sessions').countDocuments()}`);

    // Show sample documents if available
    const movieCount = await db.collection('movies').countDocuments();
    if (movieCount > 0) {
      console.log("\nSample movie:");
      const sampleMovie = await db.collection('movies').findOne({}, {projection: {title: 1, year: 1, genres: 1, _id: 0}});
      console.log(JSON.stringify(sampleMovie, null, 2));
    }

    const commentCount = await db.collection('comments').countDocuments();
    if (commentCount > 0) {
      console.log("\nSample comment:");
      const sampleComment = await db.collection('comments').findOne({}, {projection: {name: 1, email: 1, text: 1, _id: 0}});
      console.log(JSON.stringify(sampleComment, null, 2));
    }

    console.log("\nYou can now run: node queries.js");

  } catch (error) {
    if (!handleConnectionError(error)) {
      console.error('Error during import:', error.message || error);
    }
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the import
main().catch(error => {
  if (!handleConnectionError(error)) {
    console.error(error);
  }
  process.exit(1);
});
