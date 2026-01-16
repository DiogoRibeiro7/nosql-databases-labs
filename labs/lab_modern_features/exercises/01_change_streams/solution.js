/**
 * Exercise 01: Change Streams - Real-time Data Monitoring
 *
 * Change Streams allow applications to access real-time data changes without
 * the complexity and risk of tailing the oplog. Applications can use change
 * streams to subscribe to all data changes on a single collection, database,
 * or entire deployment.
 */

const { MongoClient } = require("mongodb");
const EventEmitter = require("events");

class ChangeStreamExercises {
  constructor(connectionUrl) {
    this.connectionUrl = connectionUrl || "mongodb://localhost:27017";
    this.client = null;
    this.db = null;
    this.eventEmitter = new EventEmitter();
  }

  async connect() {
    this.client = new MongoClient(this.connectionUrl);
    await this.client.connect();
    this.db = this.client.db("modern_features_lab");
    console.log("Connected to MongoDB");
  }

  /**
   * Exercise 1: Basic Change Stream
   * Monitor all changes to a collection
   */
  async basicChangeStream() {
    const collection = this.db.collection("inventory");

    // Create a change stream
    const changeStream = collection.watch();

    console.log("Watching for changes on inventory collection...");

    // Listen for changes
    changeStream.on("change", (change) => {
      console.log("Change detected:", JSON.stringify(change, null, 2));
      this.eventEmitter.emit("change", change);
    });

    // Simulate some changes
    setTimeout(async () => {
      await collection.insertOne({
        item: "laptop",
        qty: 10,
        price: 999.99,
        timestamp: new Date(),
      });

      await collection.updateOne({ item: "laptop" }, { $inc: { qty: 5 } });

      await collection.deleteOne({ item: "laptop" });
    }, 1000);

    // Keep the stream open for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await changeStream.close();
  }

  /**
   * Exercise 2: Filtered Change Stream
   * Monitor only specific types of operations
   */
  async filteredChangeStream() {
    const collection = this.db.collection("orders");

    // Watch only for insert and update operations
    const pipeline = [
      {
        $match: {
          operationType: { $in: ["insert", "update"] },
        },
      },
    ];

    const changeStream = collection.watch(pipeline);

    console.log("Watching for insert and update operations on orders...");

    changeStream.on("change", (change) => {
      console.log(`${change.operationType} operation detected:`);

      if (change.operationType === "insert") {
        console.log("New order:", change.fullDocument);
      } else if (change.operationType === "update") {
        console.log("Updated fields:", change.updateDescription.updatedFields);
      }
    });

    // Simulate operations
    setTimeout(async () => {
      // This will be captured
      await collection.insertOne({
        orderId: "ORD-001",
        customer: "Alice Smith",
        total: 150.0,
        status: "pending",
      });

      // This will be captured
      await collection.updateOne({ orderId: "ORD-001" }, { $set: { status: "processing" } });

      // This will NOT be captured (delete operation)
      await collection.deleteOne({ orderId: "ORD-001" });
    }, 1000);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await changeStream.close();
  }

  /**
   * Exercise 3: Change Stream with Full Document
   * Get the full document on updates
   */
  async fullDocumentChangeStream() {
    const collection = this.db.collection("products");

    // Request full document on updates
    const options = { fullDocument: "updateLookup" };
    const changeStream = collection.watch([], options);

    console.log("Watching with full document lookup...");

    changeStream.on("change", (change) => {
      if (change.operationType === "update") {
        console.log("Full updated document:", change.fullDocument);
      }
    });

    // Create and update a product
    await collection.insertOne({
      productId: "PROD-001",
      name: "Wireless Mouse",
      price: 29.99,
      stock: 100,
    });

    await collection.updateOne(
      { productId: "PROD-001" },
      {
        $inc: { stock: -5 },
        $set: { lastSold: new Date() },
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await changeStream.close();
  }

  /**
   * Exercise 4: Resume Token
   * Resume watching from a specific point
   */
  async resumableChangeStream() {
    const collection = this.db.collection("events");
    let resumeToken = null;

    // First change stream
    const changeStream1 = collection.watch();

    changeStream1.on("change", (change) => {
      console.log("First stream - Change detected");
      resumeToken = change._id;
    });

    // Insert some events
    await collection.insertOne({ event: "user_login", timestamp: new Date() });
    await collection.insertOne({ event: "page_view", timestamp: new Date() });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await changeStream1.close();

    console.log("First stream closed. Simulating application restart...");

    // Resume from the last known position
    if (resumeToken) {
      const changeStream2 = collection.watch([], { resumeAfter: resumeToken });

      changeStream2.on("change", (change) => {
        console.log("Resumed stream - Change detected:", change.fullDocument);
      });

      // These changes will be captured by the resumed stream
      await collection.insertOne({ event: "user_logout", timestamp: new Date() });
      await collection.insertOne({ event: "purchase", timestamp: new Date() });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await changeStream2.close();
    }
  }

  /**
   * Exercise 5: Database-level Change Stream
   * Monitor all collections in a database
   */
  async databaseChangeStream() {
    // Watch all collections in the database
    const changeStream = this.db.watch();

    console.log("Watching all collections in the database...");

    changeStream.on("change", (change) => {
      console.log(`Change in collection ${change.ns.coll}:`, {
        operation: change.operationType,
        documentKey: change.documentKey,
      });
    });

    // Make changes in different collections
    await this.db.collection("users").insertOne({
      username: "john_doe",
      email: "john@example.com",
    });

    await this.db.collection("posts").insertOne({
      title: "Hello World",
      author: "john_doe",
    });

    await this.db.collection("comments").insertOne({
      postId: "post-1",
      text: "Great post!",
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await changeStream.close();
  }

  /**
   * Exercise 6: Real-time Inventory Tracking
   * Practical example: Track inventory changes and send alerts
   */
  async inventoryTracking() {
    const inventory = this.db.collection("inventory_tracking");

    // Initialize some products
    await inventory.insertMany([
      { sku: "SKU-001", name: "Laptop", quantity: 50, minStock: 10 },
      { sku: "SKU-002", name: "Mouse", quantity: 100, minStock: 20 },
      { sku: "SKU-003", name: "Keyboard", quantity: 5, minStock: 15 },
    ]);

    // Watch for inventory updates
    const pipeline = [
      {
        $match: {
          $or: [{ operationType: "update" }, { operationType: "replace" }],
        },
      },
    ];

    const changeStream = inventory.watch(pipeline, { fullDocument: "updateLookup" });

    changeStream.on("change", async (change) => {
      const doc = change.fullDocument;

      if (doc && doc.quantity < doc.minStock) {
        console.log(`⚠️ LOW STOCK ALERT: ${doc.name} (SKU: ${doc.sku})`);
        console.log(`   Current: ${doc.quantity}, Minimum: ${doc.minStock}`);

        // Log alert to alerts collection
        await this.db.collection("alerts").insertOne({
          type: "low_stock",
          sku: doc.sku,
          product: doc.name,
          currentStock: doc.quantity,
          minStock: doc.minStock,
          timestamp: new Date(),
        });
      }
    });

    // Simulate inventory changes
    console.log("Simulating inventory changes...");

    // Normal update - no alert
    await inventory.updateOne({ sku: "SKU-001" }, { $inc: { quantity: -10 } });

    // This should trigger a low stock alert
    await inventory.updateOne({ sku: "SKU-003" }, { $inc: { quantity: -3 } });

    // This should also trigger an alert
    await inventory.updateOne({ sku: "SKU-002" }, { $set: { quantity: 15 } });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await changeStream.close();

    // Show all alerts
    const alerts = await this.db.collection("alerts").find({}).toArray();
    console.log("\nGenerated Alerts:", alerts);
  }

  /**
   * Exercise 7: Aggregation Pipeline in Change Streams
   * Process changes with aggregation stages
   */
  async aggregationChangeStream() {
    const transactions = this.db.collection("transactions");

    // Complex pipeline with aggregation
    const pipeline = [
      {
        $match: {
          operationType: "insert",
          "fullDocument.amount": { $gte: 1000 },
        },
      },
      {
        $addFields: {
          alertLevel: {
            $switch: {
              branches: [
                { case: { $gte: ["$fullDocument.amount", 10000] }, then: "HIGH" },
                { case: { $gte: ["$fullDocument.amount", 5000] }, then: "MEDIUM" },
                { case: { $gte: ["$fullDocument.amount", 1000] }, then: "LOW" },
              ],
            },
          },
        },
      },
    ];

    const changeStream = transactions.watch(pipeline);

    changeStream.on("change", (change) => {
      console.log(`Large transaction detected (${change.alertLevel} priority):`);
      console.log(`  Amount: $${change.fullDocument.amount}`);
      console.log(`  Account: ${change.fullDocument.accountId}`);
      console.log(`  Type: ${change.fullDocument.type}`);
    });

    // Simulate transactions
    const testTransactions = [
      { accountId: "ACC-001", amount: 500, type: "deposit" }, // Won't trigger
      { accountId: "ACC-002", amount: 1500, type: "deposit" }, // LOW
      { accountId: "ACC-003", amount: 7500, type: "withdrawal" }, // MEDIUM
      { accountId: "ACC-004", amount: 15000, type: "transfer" }, // HIGH
    ];

    for (const txn of testTransactions) {
      await transactions.insertOne({
        ...txn,
        timestamp: new Date(),
        transactionId: `TXN-${Date.now()}`,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await changeStream.close();
  }

  async cleanup() {
    // Clean up test collections
    const collections = [
      "inventory",
      "orders",
      "products",
      "events",
      "users",
      "posts",
      "comments",
      "inventory_tracking",
      "alerts",
      "transactions",
    ];

    for (const coll of collections) {
      await this.db
        .collection(coll)
        .drop()
        .catch(() => {});
    }

    await this.client.close();
    console.log("Cleanup completed");
  }
}

// Main execution
async function main() {
  const exercises = new ChangeStreamExercises();

  try {
    await exercises.connect();

    console.log("\n=== Exercise 1: Basic Change Stream ===\n");
    await exercises.basicChangeStream();

    console.log("\n=== Exercise 2: Filtered Change Stream ===\n");
    await exercises.filteredChangeStream();

    console.log("\n=== Exercise 3: Full Document Change Stream ===\n");
    await exercises.fullDocumentChangeStream();

    console.log("\n=== Exercise 4: Resumable Change Stream ===\n");
    await exercises.resumableChangeStream();

    console.log("\n=== Exercise 5: Database-level Change Stream ===\n");
    await exercises.databaseChangeStream();

    console.log("\n=== Exercise 6: Real-time Inventory Tracking ===\n");
    await exercises.inventoryTracking();

    console.log("\n=== Exercise 7: Aggregation Pipeline Change Stream ===\n");
    await exercises.aggregationChangeStream();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await exercises.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = ChangeStreamExercises;
