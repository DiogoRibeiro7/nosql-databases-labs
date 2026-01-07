/**
 * Lab 05 - Replication Test Suite
 *
 * This script tests the replication setup and functionality
 */

const { MongoClient } = require("mongodb");
const { REPLICA_SET_NAME } = require("./setup_replica_set");

class ReplicationTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async connect() {
    const uri = `mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=${REPLICA_SET_NAME}`;
    this.client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    try {
      await this.client.connect();
      console.log("✓ Connected to replica set");
      return true;
    } catch (error) {
      console.error("✗ Failed to connect:", error.message);
      return false;
    }
  }

  async test(name, testFunc) {
    console.log(`\nTesting: ${name}`);
    try {
      await testFunc();
      console.log(`✓ ${name} passed`);
      this.passed++;
      this.tests.push({ name, status: "passed" });
    } catch (error) {
      console.error(`✗ ${name} failed:`, error.message);
      this.failed++;
      this.tests.push({ name, status: "failed", error: error.message });
    }
  }

  async runTests() {
    console.log("=".repeat(60));
    console.log("Lab 05 - Replication Test Suite");
    console.log("=".repeat(60));

    if (!(await this.connect())) {
      console.error("\n⚠ Cannot proceed without connection to replica set");
      console.log("Please run: node setup_replica_set.js");
      return false;
    }

    // Test 1: Replica set is configured
    await this.test("Replica set configuration", async () => {
      const admin = this.client.db("admin");
      const status = await admin.command({ replSetGetStatus: 1 });

      if (!status.set) {
        throw new Error("No replica set configured");
      }

      if (status.set !== REPLICA_SET_NAME) {
        throw new Error(`Wrong replica set name: ${status.set}`);
      }

      console.log(`  Replica set: ${status.set}`);
      console.log(`  Members: ${status.members.length}`);
    });

    // Test 2: Primary exists
    await this.test("Primary member exists", async () => {
      const admin = this.client.db("admin");
      const status = await admin.command({ replSetGetStatus: 1 });

      const primary = status.members.find((m) => m.stateStr === "PRIMARY");
      if (!primary) {
        throw new Error("No primary found");
      }

      console.log(`  Primary: ${primary.name}`);
    });

    // Test 3: Secondaries exist
    await this.test("Secondary members exist", async () => {
      const admin = this.client.db("admin");
      const status = await admin.command({ replSetGetStatus: 1 });

      const secondaries = status.members.filter((m) => m.stateStr === "SECONDARY");
      if (secondaries.length < 2) {
        throw new Error(`Only ${secondaries.length} secondaries found, expected at least 2`);
      }

      secondaries.forEach((s) => {
        console.log(`  Secondary: ${s.name}`);
      });
    });

    // Test 4: Write and read operations
    await this.test("Write and read operations", async () => {
      const db = this.client.db("lab05_test");
      const collection = db.collection("test_collection");

      // Write
      const doc = {
        test_id: Date.now(),
        message: "Replication test document",
        timestamp: new Date(),
      };

      const writeResult = await collection.insertOne(doc);
      if (!writeResult.acknowledged) {
        throw new Error("Write not acknowledged");
      }

      // Read
      const readResult = await collection.findOne({ _id: writeResult.insertedId });
      if (!readResult) {
        throw new Error("Could not read back document");
      }

      console.log(`  Write acknowledged: ${writeResult.acknowledged}`);
      console.log(`  Read successful: ${readResult.test_id === doc.test_id}`);
    });

    // Test 5: Read from secondary
    await this.test("Read from secondary", async () => {
      const secondaryClient = new MongoClient(
        `mongodb://localhost:27018/?directConnection=true&readPreference=secondary`
      );

      await secondaryClient.connect();
      const db = secondaryClient.db("lab05_test");
      const collection = db.collection("test_collection");

      // Enable reading from secondary
      await secondaryClient.db("admin").command({ setSecondaryOk: 1 });

      const count = await collection.countDocuments();
      console.log(`  Documents readable from secondary: ${count}`);

      await secondaryClient.close();
    });

    // Test 6: Write concerns
    await this.test("Write concern majority", async () => {
      const db = this.client.db("lab05_test");
      const collection = db.collection("write_concern_test");

      const doc = {
        test: "majority write",
        timestamp: new Date(),
      };

      const result = await collection.insertOne(doc, {
        writeConcern: { w: "majority", wtimeout: 5000 },
      });

      if (!result.acknowledged) {
        throw new Error("Majority write not acknowledged");
      }

      console.log(`  Majority write acknowledged: ${result.acknowledged}`);
    });

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`\nPassed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`Total: ${this.tests.length}`);

    if (this.failed === 0) {
      console.log("\n✓ All tests passed!");
    } else {
      console.log("\n✗ Some tests failed:");
      this.tests
        .filter((t) => t.status === "failed")
        .forEach((t) => console.log(`  - ${t.name}: ${t.error}`));
    }

    return this.failed === 0;
  }

  async cleanup() {
    if (this.client) {
      await this.client.close();
    }
  }
}

// Run tests
async function main() {
  const tester = new ReplicationTester();

  try {
    const success = await tester.runTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("Test suite error:", error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ReplicationTester };
