/**
 * Lab 02 - Database Reset Script
 *
 * This script drops the lab02_ecommerce database and all its collections.
 * Use this to start fresh with the lab exercises.
 */

const { MongoClient } = require("mongodb");

const DATABASE_NAME = "lab02_ecommerce";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

/**
 * Drop the entire lab02 database after confirming it exists.
 *
 * @returns {Promise<void>}
 */
async function resetDatabase () {
  let client;

  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected successfully to MongoDB");

    // Check if database exists
    // Query the admin DB to check if the target database is present.
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    const dbExists = databases.databases.some(db => db.name === DATABASE_NAME);

    if (!dbExists) {
      console.log(`\nDatabase "${DATABASE_NAME}" does not exist.`);
      console.log("Nothing to reset.");
      return;
    }

    // Drop the database
    console.log(`\nDropping database: ${DATABASE_NAME}`);
    const db = client.db(DATABASE_NAME);

    // List collections before dropping
    const collections = await db.listCollections().toArray();
    if (collections.length > 0) {
      console.log("Collections to be removed:");
      collections.forEach(col => console.log(`  - ${col.name}`));
    }

    // Drop the entire database
    await db.dropDatabase();
    console.log(`\n✓ Database "${DATABASE_NAME}" has been dropped successfully!`);

    // Verify deletion
    const updatedDatabases = await admin.listDatabases();
    const stillExists = updatedDatabases.databases.some(db => db.name === DATABASE_NAME);

    if (!stillExists) {
      console.log("✓ Database reset completed.");
      console.log("\nYou can now run the import_data.js script to set up fresh data.");
    } else {
      console.warn("⚠ Warning: Database still appears to exist.");
    }
  } catch (error) {
    console.error("\nError during reset:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("\nDisconnected from MongoDB");
    }
  }
}

// Add confirmation prompt when run directly
/**
 * Ask the user to confirm destructive work before running resetDatabase.
 *
 * @returns {Promise<boolean>} Whether the user typed yes/y.
 */
async function promptConfirmation () {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Wrap readline question into a Promise so callers can await the answer.
  return new Promise(resolve => {
    rl.question(
      `\n⚠️  WARNING: This will delete the entire "${DATABASE_NAME}" database!\n` +
        "Are you sure you want to continue? (yes/no): ",
      answer => {
        rl.close();
        resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
      }
    );
  });
}

// Run the reset
if (require.main === module) {
  (async () => {
    console.log("=".repeat(60));
    console.log("Lab 02 - Database Reset Utility");
    console.log("=".repeat(60));

    const confirmed = await promptConfirmation();

    if (confirmed) {
      await resetDatabase();
    } else {
      console.log("\nDatabase reset cancelled.");
    }
  })().catch(console.error);
}

module.exports = { resetDatabase, DATABASE_NAME };
