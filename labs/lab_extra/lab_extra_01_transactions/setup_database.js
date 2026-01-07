// Setup script for Lab Extra 01 - Transactions
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "lab_extra_transactions";

async function setupDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Drop existing database
    await db.dropDatabase();
    console.log("Dropped existing database");

    // Create collections
    await db.createCollection("accounts");
    await db.createCollection("transactions");
    await db.createCollection("inventory");
    await db.createCollection("orders");
    await db.createCollection("payments");
    await db.createCollection("locks");

    // Insert sample account data
    const accounts = db.collection("accounts");
    const transactions = db.collection("transactions");
    const orders = db.collection("orders");
    await accounts.insertMany([
      { _id: "ACC001", name: "Alice", balance: 1000, currency: "USD" },
      { _id: "ACC002", name: "Bob", balance: 500, currency: "USD" },
      { _id: "ACC003", name: "Charlie", balance: 1500, currency: "USD" },
      { _id: "ACC004", name: "Diana", balance: 2000, currency: "USD" },
      { _id: "ACC005", name: "Eve", balance: 750, currency: "USD" },
    ]);
    console.log("Created accounts collection with sample data");

    // Insert sample inventory data
    const inventory = db.collection("inventory");
    await inventory.insertMany([
      { _id: "PROD001", name: "Laptop", quantity: 50, price: 999.99, reserved: 0 },
      { _id: "PROD002", name: "Mouse", quantity: 200, price: 29.99, reserved: 0 },
      { _id: "PROD003", name: "Keyboard", quantity: 150, price: 79.99, reserved: 0 },
      { _id: "PROD004", name: "Monitor", quantity: 75, price: 299.99, reserved: 0 },
      { _id: "PROD005", name: "Headphones", quantity: 100, price: 149.99, reserved: 0 },
    ]);
    console.log("Created inventory collection with sample data");

    // Create indexes
    await accounts.createIndex({ name: 1 });
    await transactions.createIndex({ timestamp: -1 });
    await transactions.createIndex({ from: 1, to: 1 });
    await inventory.createIndex({ name: 1 });
    await orders.createIndex({ customerId: 1 });
    await orders.createIndex({ status: 1, createdAt: -1 });

    console.log("Created indexes");

    // Verify replica set (required for transactions)
    const admin = db.admin();
    const status = await admin.command({ replSetGetStatus: 1 }).catch(() => null);

    if (!status) {
      console.warn("\n⚠️  WARNING: MongoDB is not running as a replica set.");
      console.warn("Transactions require a replica set. To enable:");
      console.warn("1. Stop MongoDB");
      console.warn("2. Start with: mongod --replSet rs0");
      console.warn("3. Initialize: rs.initiate()");
    } else {
      console.log("✓ Replica set detected - transactions are supported");
    }

    console.log("\nDatabase setup completed successfully!");
  } catch (error) {
    console.error("Setup failed:", error);
  } finally {
    await client.close();
  }
}

// Run setup
setupDatabase();
