/**
 * Lab 05 - Failover Simulation
 *
 * This script simulates a primary failure and demonstrates automatic failover
 * in a MongoDB replica set.
 */

const { MongoClient } = require("mongodb");
const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);

const REPLICA_SET_NAME = "lab05-rs";
const PORTS = [27017, 27018, 27019];

class FailoverSimulator {
  constructor() {
    this.clients = {};
    this.primaryPort = null;
    this.isMonitoring = false;
  }

  // Connect to replica set
  async connect() {
    const uri = `mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=${REPLICA_SET_NAME}`;

    try {
      this.mainClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 1000,
      });

      await this.mainClient.connect();
      console.log("✓ Connected to replica set");

      // Connect to each member directly
      for (const port of PORTS) {
        const directUri = `mongodb://localhost:${port}/?directConnection=true`;
        const client = new MongoClient(directUri, {
          serverSelectionTimeoutMS: 2000,
        });

        try {
          await client.connect();
          this.clients[port] = client;
          console.log(`✓ Direct connection to port ${port}`);
        } catch (error) {
          console.log(`✗ Could not connect to port ${port}: ${error.message}`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to connect to replica set: ${error.message}`);
    }
  }

  // Get current replica set status
  async getStatus() {
    const status = {
      primary: null,
      secondaries: [],
      arbiters: [],
      down: [],
    };

    for (const port of PORTS) {
      const client = this.clients[port];

      if (!client) {
        status.down.push(port);
        continue;
      }

      try {
        const admin = client.db("admin");
        const isMasterResult = await admin.command({ isMaster: 1 });

        if (isMasterResult.ismaster) {
          status.primary = port;
        } else if (isMasterResult.secondary) {
          status.secondaries.push(port);
        } else if (isMasterResult.arbiterOnly) {
          status.arbiters.push(port);
        } else {
          status.down.push(port);
        }
      } catch (error) {
        console.log(`✗ Unable to read status from port ${port}: ${error.message}`);
        status.down.push(port);
      }
    }

    return status;
  }

  // Display current topology
  async displayTopology() {
    console.log("\n" + "=".repeat(60));
    console.log("Current Replica Set Topology");
    console.log("=".repeat(60));

    const status = await this.getStatus();

    console.log(`\nPrimary: ${status.primary ? `Port ${status.primary} ⭐` : "None"}`);
    console.log(
      `Secondaries: ${status.secondaries.length > 0 ? status.secondaries.map((p) => `Port ${p}`).join(", ") : "None"}`
    );

    if (status.down.length > 0) {
      console.log(`Down: ${status.down.map((p) => `Port ${p} ❌`).join(", ")}`);
    }

    return status;
  }

  // Simulate continuous writes to test failover
  async startContinuousWrites() {
    console.log("\n" + "=".repeat(60));
    console.log("Starting Continuous Write Test");
    console.log("=".repeat(60));

    const db = this.mainClient.db("lab05_replication");
    const collection = db.collection("failover_test");

    let writeCount = 0;
    let errorCount = 0;
    let lastError = null;

    const writeInterval = setInterval(async () => {
      try {
        const doc = {
          timestamp: new Date(),
          write_number: writeCount++,
          message: `Test write ${writeCount}`,
        };

        await collection.insertOne(doc, {
          w: "majority",
          wtimeout: 5000,
        });

        process.stdout.write(".");

        if (lastError) {
          console.log(`\n✓ Writes resumed after failover! (Write #${writeCount})`);
          lastError = null;
        }
      } catch (error) {
        errorCount++;

        if (error.message !== lastError) {
          console.log(`\n✗ Write error: ${error.message}`);
          lastError = error.message;
        }

        process.stdout.write("x");
      }
    }, 1000); // Write every second

    return {
      stop: () => {
        clearInterval(writeInterval);
        console.log(`\n\nWrite test stopped. Total writes: ${writeCount}, Errors: ${errorCount}`);
        return { writes: writeCount, errors: errorCount };
      },
    };
  }

  // Monitor replica set changes
  async startMonitoring() {
    console.log("\n" + "=".repeat(60));
    console.log("Starting Replica Set Monitor");
    console.log("=".repeat(60));

    this.isMonitoring = true;
    let lastPrimary = null;
    let electionCount = 0;

    const monitorInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        clearInterval(monitorInterval);
        return;
      }

      try {
        const status = await this.getStatus();

        if (status.primary !== lastPrimary) {
          electionCount++;

          if (lastPrimary === null) {
            console.log(`\n[${new Date().toISOString()}] Initial Primary: Port ${status.primary}`);
          } else if (status.primary === null) {
            console.log(`\n[${new Date().toISOString()}] ⚠️  PRIMARY FAILED! No primary available`);
          } else {
            console.log(
              `\n[${new Date().toISOString()}] 🔄 ELECTION COMPLETE! New Primary: Port ${status.primary}`
            );
            console.log(`   Election #${electionCount} completed`);
          }

          lastPrimary = status.primary;
        }
      } catch (error) {
        console.log(`\nMonitoring error: ${error.message}`);
      }
    }, 500); // Check every 500ms

    return {
      stop: () => {
        this.isMonitoring = false;
        console.log(`\nMonitoring stopped. Total elections observed: ${electionCount}`);
      },
    };
  }

  // Kill the primary to simulate failure
  async killPrimary() {
    console.log("\n" + "=".repeat(60));
    console.log("Simulating Primary Failure");
    console.log("=".repeat(60));

    const status = await this.getStatus();

    if (!status.primary) {
      throw new Error("No primary found to kill");
    }

    const primaryPort = status.primary;
    console.log(`\n⚠️  Killing primary on port ${primaryPort}...`);

    try {
      // Try to shut down gracefully first
      const client = this.clients[primaryPort];
      if (client) {
        try {
          const admin = client.db("admin");
          await admin.command({ shutdown: 1, force: true });
        } catch {
          // Expected - connection will be closed
        }
      }

      // Give it a moment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Forcefully kill if still running (platform-specific)
      if (process.platform === "win32") {
        // Windows: Find and kill process by port
        try {
          const { stdout } = await execPromise(`netstat -ano | findstr :${primaryPort}`);
          const lines = stdout.split("\n");
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              await execPromise(`taskkill /F /PID ${pid}`);
              break;
            }
          }
        } catch {
          // Process might already be dead
        }
      } else {
        // Unix/Linux/Mac: Kill process by port
        try {
          await execPromise(`lsof -ti:${primaryPort} | xargs kill -9`);
        } catch {
          // Process might already be dead
        }
      }

      console.log(`✓ Primary on port ${primaryPort} has been killed`);

      // Close the client for the killed instance
      if (this.clients[primaryPort]) {
        await this.clients[primaryPort].close();
        delete this.clients[primaryPort];
      }

      return primaryPort;
    } catch (error) {
      console.error(`Error killing primary: ${error.message}`);
      throw error;
    }
  }

  // Wait for new primary election
  async waitForNewPrimary(oldPrimary, timeout = 30000) {
    console.log("\n⏳ Waiting for new primary election...");

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getStatus();

      if (status.primary && status.primary !== oldPrimary) {
        console.log(`\n✓ New primary elected on port ${status.primary}`);
        return status.primary;
      }

      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error("Timeout waiting for new primary");
  }

  // Restart a killed member
  async restartMember(port) {
    console.log(`\n🔄 Restarting member on port ${port}...`);

    const dataPath = `./data/node${port}`;
    const logPath = `./logs/mongod-${port}.log`;

    const command =
      process.platform === "win32"
        ? `start mongod --replSet ${REPLICA_SET_NAME} --port ${port} --dbpath ${dataPath} --logpath ${logPath}`
        : `mongod --replSet ${REPLICA_SET_NAME} --port ${port} --dbpath ${dataPath} --logpath ${logPath} --fork`;

    try {
      await execPromise(command);
      console.log(`✓ Member restarted on port ${port}`);

      // Wait for it to rejoin
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Reconnect
      const directUri = `mongodb://localhost:${port}/?directConnection=true`;
      const client = new MongoClient(directUri);
      await client.connect();
      this.clients[port] = client;

      return true;
    } catch (error) {
      console.error(`Failed to restart member: ${error.message}`);
      return false;
    }
  }

  // Run complete failover simulation
  async runSimulation() {
    console.log("\n" + "█".repeat(60));
    console.log("FAILOVER SIMULATION");
    console.log("█".repeat(60));

    try {
      // Step 1: Show initial topology
      await this.displayTopology();

      // Step 2: Start monitoring
      const monitor = await this.startMonitoring();

      // Step 3: Start continuous writes
      const writeTest = await this.startContinuousWrites();

      // Wait a bit to establish baseline
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Step 4: Kill the primary
      const killedPort = await this.killPrimary();

      // Step 5: Wait for new primary election
      const newPrimary = await this.waitForNewPrimary(killedPort);

      // Step 6: Let writes continue for a bit
      console.log("\n📝 Observing write behavior after failover...");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Step 7: Stop writes and monitoring
      const writeStats = writeTest.stop();
      monitor.stop();

      // Step 8: Show final topology
      await this.displayTopology();

      // Step 9: Optionally restart the killed member
      console.log("\n" + "=".repeat(60));
      console.log("Recovery Phase");
      console.log("=".repeat(60));

      const restart = await this.promptUser("Do you want to restart the killed member? (y/n): ");
      if (restart.toLowerCase() === "y") {
        await this.restartMember(killedPort);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await this.displayTopology();
      }

      // Summary
      console.log("\n" + "█".repeat(60));
      console.log("SIMULATION SUMMARY");
      console.log("█".repeat(60));
      console.log(`\nResults:`);
      console.log(`  - Primary failed on port: ${killedPort}`);
      console.log(`  - New primary elected on port: ${newPrimary}`);
      console.log(`  - Total writes attempted: ${writeStats.writes}`);
      console.log(`  - Write errors during failover: ${writeStats.errors}`);
      console.log(`  - Failover completed successfully: ✓`);

      return true;
    } catch (error) {
      console.error(`\n✗ Simulation failed: ${error.message}`);
      return false;
    }
  }

  // Helper to prompt user
  async promptUser(question) {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  // Cleanup
  async cleanup() {
    console.log("\nCleaning up connections...");

    if (this.mainClient) {
      await this.mainClient.close();
    }

    for (const port in this.clients) {
      await this.clients[port].close();
    }

    console.log("✓ Cleanup complete");
  }
}

// Main function
async function main() {
  const simulator = new FailoverSimulator();

  try {
    await simulator.connect();
    await simulator.runSimulation();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await simulator.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  console.log("Lab 05 - MongoDB Replica Set Failover Simulation");
  console.log("=".repeat(60));
  console.log("\n⚠️  WARNING: This will kill the primary MongoDB instance!");
  console.log("Make sure you have a replica set running on ports 27017-27019.\n");

  main().catch(console.error);
}

module.exports = { FailoverSimulator };
