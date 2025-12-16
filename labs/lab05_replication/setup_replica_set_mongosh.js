/**
 * Lab 05 - Setup Replica Set (mongosh version)
 *
 * IMPORTANT: This is a manual setup guide for mongosh.
 * The automated Node.js version (setup_replica_set.js) is recommended for full automation.
 *
 * Run these commands in mongosh step by step:
 * mongosh --port 27017
 */

print("=" .repeat(60));
print("Lab 05 - MongoDB Replica Set Setup Guide");
print("=" .repeat(60));

print("\nStep 1: Start MongoDB instances");
print("-".repeat(40));
print("Open 3 separate terminals and run:");
print("");
print("Terminal 1:");
print("mongod --replSet lab05-rs --port 27017 --dbpath ./data/rs0 --logpath ./data/rs0/mongod.log --oplogSize 100");
print("");
print("Terminal 2:");
print("mongod --replSet lab05-rs --port 27018 --dbpath ./data/rs1 --logpath ./data/rs1/mongod.log --oplogSize 100");
print("");
print("Terminal 3:");
print("mongod --replSet lab05-rs --port 27019 --dbpath ./data/rs2 --logpath ./data/rs2/mongod.log --oplogSize 100");

print("\n" + "=" .repeat(60));
print("Step 2: Initialize Replica Set");
print("-".repeat(40));
print("Connect to the first instance:");
print("mongosh --port 27017");
print("");
print("Then run the following configuration:");
print("=" .repeat(60));

// Replica set configuration
const rsConfig = {
    _id: "lab05-rs",
    members: [
        {
            _id: 0,
            host: "localhost:27017",
            priority: 2
        },
        {
            _id: 1,
            host: "localhost:27018",
            priority: 1
        },
        {
            _id: 2,
            host: "localhost:27019",
            priority: 1
        }
    ]
};

print("\nConfiguration to apply:");
print(JSON.stringify(rsConfig, null, 2));

print("\n// Initialize the replica set with:");
print("rs.initiate(" + JSON.stringify(rsConfig) + ")");

print("\n" + "=" .repeat(60));
print("Step 3: Verify Replica Set Status");
print("-".repeat(40));
print("Wait 10-30 seconds for election, then run:");
print("");
print("rs.status()");
print("");
print("// Check if primary is elected:");
print("rs.isMaster()");

print("\n" + "=" .repeat(60));
print("Step 4: Create Test Data");
print("-".repeat(40));

print("\n// Switch to test database");
print("use('lab05_test')");
print("");
print("// Insert test documents");
print(`db.products.insertMany([
    { name: 'Laptop', price: 999.99, category: 'Electronics' },
    { name: 'Mouse', price: 24.99, category: 'Accessories' },
    { name: 'Keyboard', price: 79.99, category: 'Accessories' },
    { name: 'Monitor', price: 299.99, category: 'Electronics' },
    { name: 'Headphones', price: 149.99, category: 'Audio' }
])`);

print("\n" + "=" .repeat(60));
print("Step 5: Test Replication");
print("-".repeat(40));

print("\n// Connect to secondary (new terminal):");
print("mongosh --port 27018");
print("");
print("// Enable reading from secondary:");
print("rs.secondaryOk()");
print("");
print("// Verify data replicated:");
print("use('lab05_test')");
print("db.products.find()");

print("\n" + "=" .repeat(60));
print("Common Replica Set Commands");
print("-".repeat(40));

const commands = [
    { cmd: "rs.status()", desc: "Check replica set status" },
    { cmd: "rs.conf()", desc: "View replica set configuration" },
    { cmd: "rs.isMaster()", desc: "Check if current node is primary" },
    { cmd: "rs.secondaryOk()", desc: "Allow reads on secondary" },
    { cmd: "rs.stepDown()", desc: "Force primary to step down" },
    { cmd: "rs.freeze(60)", desc: "Prevent node from becoming primary for 60 seconds" },
    { cmd: "rs.add('localhost:27020')", desc: "Add new member to replica set" },
    { cmd: "rs.remove('localhost:27020')", desc: "Remove member from replica set" },
    { cmd: "rs.reconfig(newConfig)", desc: "Reconfigure replica set" },
    { cmd: "rs.printReplicationInfo()", desc: "Print oplog information" },
    { cmd: "rs.printSecondaryReplicationInfo()", desc: "Print sync status of secondaries" }
];

print("\nUseful commands for managing replica set:\n");
commands.forEach(item => {
    print(`${item.cmd.padEnd(40)} // ${item.desc}`);
});

print("\n" + "=" .repeat(60));
print("Testing Failover");
print("-".repeat(40));

print("\n// Step 1: Connect to primary");
print("mongosh --port 27017");
print("");
print("// Step 2: Force primary to step down");
print("rs.stepDown(60)");
print("");
print("// Step 3: Watch election process");
print("rs.status()");
print("");
print("// Step 4: Verify new primary");
print("// Connect to another node and check:");
print("rs.isMaster()");

print("\n" + "=" .repeat(60));
print("Cleanup Instructions");
print("-".repeat(40));

print("\nTo tear down the replica set:");
print("1. Connect to each member and shut down:");
print("   use('admin')");
print("   db.shutdownServer()");
print("");
print("2. Remove data directories:");
print("   rm -rf ./data/rs0 ./data/rs1 ./data/rs2");

print("\n" + "=" .repeat(60));
print("✓ Setup guide complete!");
print("Follow the steps above to manually set up a replica set in mongosh");
print("=" .repeat(60));