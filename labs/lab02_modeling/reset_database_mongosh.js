/**
 * Lab 02 - Database Reset Script (mongosh version)
 *
 * This script drops the lab02_ecommerce database and all its collections.
 * Use this to start fresh with the lab exercises.
 *
 * Run this file in mongosh:
 *   mongosh --file reset_database_mongosh.js
 *
 * Or explicitly targeting the DB (still safe; we also call use()):
 *   mongosh lab02_ecommerce --file reset_database_mongosh.js
 *
 * Notes (mongosh constraints):
 * - No MongoClient, no require(), no readline prompt.
 * - We implement a simple confirmation gate using a variable:
 *     - By default, this script will NOT drop anything.
 *     - To actually drop, run mongosh with:
 *         mongosh --eval "var CONFIRM_DROP=true" --file reset_database_mongosh.js
 */

const DATABASE_NAME = "lab02_ecommerce";

// Safety switch: must be explicitly set to true via --eval
const CONFIRM_DROP = typeof CONFIRM_DROP === "boolean" ? CONFIRM_DROP : false;

function banner(title) {
  print("=".repeat(60));
  print(title);
  print("=".repeat(60));
}

banner("Lab 02 - Database Reset Utility (mongosh)");

if (!CONFIRM_DROP) {
  print("\n⚠️  REFUSING TO DROP DATABASE (confirmation not provided)");
  print(`Target DB: "${DATABASE_NAME}"`);
  print("\nTo run the destructive reset, execute:");
  print(`  mongosh --eval "var CONFIRM_DROP=true" --file reset_database_mongosh.js`);
  print("\nNo changes were made.");
} else {
  print("\n⚠️  WARNING: You confirmed database deletion.");
  print(`Dropping database: "${DATABASE_NAME}"`);

  // Switch to the target DB so `db` points to it.
  use(DATABASE_NAME);

  // List collections before dropping (best-effort).
  let collections = [];
  try {
    collections = db.getCollectionNames();
  } catch {
    // ignore; dropDatabase can still proceed
  }

  if (collections && collections.length > 0) {
    print("\nCollections to be removed:");
    collections.forEach((name) => print(`  - ${name}`));
  } else {
    print("\nNo collections found (database may be empty or not present).");
  }

  // Drop the entire database.
  // In mongosh, db.dropDatabase() returns an object like { ok: 1, dropped: "..." }.
  const res = db.dropDatabase();

  print("\nDrop result:");
  printjson(res);

  // Verify by checking database list (best-effort).
  // adminCommand/listDatabases requires privileges; if it fails, we still report the drop result.
  try {
    const admin = db.getSiblingDB("admin");
    const dbs = admin.runCommand({ listDatabases: 1 });

    if (dbs && dbs.databases) {
      const stillExists = dbs.databases.some((d) => d.name === DATABASE_NAME);
      if (!stillExists) {
        print(`\n✓ Database "${DATABASE_NAME}" has been dropped successfully!`);
        print("✓ Database reset completed.");
        print("\nYou can now run your import script to set up fresh data.");
      } else {
        print(`\n⚠ Warning: Database "${DATABASE_NAME}" still appears in listDatabases().`);
        print("This can happen if you lack privileges or if the drop did not complete.");
      }
    } else {
      print("\nℹ Could not verify via listDatabases() (unexpected response).");
    }
  } catch {
    print("\nℹ Could not verify via listDatabases() (insufficient privileges or admin access).");
    print("If dropDatabase returned ok: 1, the operation likely succeeded.");
  }
}
