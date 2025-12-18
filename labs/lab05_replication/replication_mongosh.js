/**
 * Lab 05 - Replication Management (mongosh version)
 *
 * Run this file in mongosh connected to replica set:
 * mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs" --file replication_mongosh.js
 *
 * This script demonstrates replica set management and operations
 */

print("=".repeat(60));
print("Lab 05 - MongoDB Replica Set Operations");
print("=".repeat(60));

// ========================================================================
// 1. Replica Set Status and Configuration
// ========================================================================
print("\n1. REPLICA SET STATUS");
print("-".repeat(40));

// Get replica set status
const rsStatus = rs.status();

print(`\nReplica Set: ${rsStatus.set}`);
print(`Members: ${rsStatus.members.length}`);
print(`Current Term: ${rsStatus.term}`);

print("\nMember Status:");
rsStatus.members.forEach((member) => {
  const isPrimary = member.stateStr === "PRIMARY" ? " ⭐" : "";
  print(`\n${member.name}${isPrimary}`);
  print(`  State: ${member.stateStr}`);
  print(`  Health: ${member.health === 1 ? "✓ Healthy" : "✗ Unhealthy"}`);
  print(`  Uptime: ${member.uptime} seconds`);

  if (member.stateStr === "SECONDARY") {
    const lagSecs = member.optimeDate ? (rsStatus.date - member.optimeDate) / 1000 : 0;
    print(`  Replication Lag: ${lagSecs.toFixed(1)} seconds`);
  }

  if (member.lastHeartbeatMessage) {
    print(`  Last Message: ${member.lastHeartbeatMessage}`);
  }
});

// ========================================================================
// 2. Replica Set Configuration
// ========================================================================
print("\n2. REPLICA SET CONFIGURATION");
print("-".repeat(40));

const rsConfig = rs.conf();

print(`\nConfiguration Version: ${rsConfig.version}`);
print(`Protocol Version: ${rsConfig.protocolVersion}`);
print(`Settings:`);

if (rsConfig.settings) {
  print(`  Election Timeout: ${rsConfig.settings.electionTimeoutMillis || 10000}ms`);
  print(`  Heartbeat Timeout: ${rsConfig.settings.heartbeatTimeoutSecs || 10}s`);
  print(`  Catchup Timeout: ${rsConfig.settings.catchUpTimeoutMillis || -1}ms`);
}

print("\nMembers Configuration:");
rsConfig.members.forEach((member) => {
  print(`\n${member.host} (id: ${member._id})`);
  print(`  Priority: ${member.priority}`);
  print(`  Votes: ${member.votes}`);

  if (member.hidden) print(`  Hidden: true`);
  if (member.slaveDelay) print(`  Slave Delay: ${member.slaveDelay}s`);
  if (member.arbiterOnly) print(`  Arbiter: true`);
  if (member.tags) print(`  Tags: ${JSON.stringify(member.tags)}`);
});

// ========================================================================
// 3. Replication Info
// ========================================================================
print("\n3. REPLICATION INFORMATION");
print("-".repeat(40));

// Print replication info
rs.printReplicationInfo();

// Print secondary replication info
print("\nSecondary Replication Status:");
rs.printSecondaryReplicationInfo();

// ========================================================================
// 4. Oplog Statistics
// ========================================================================
print("\n4. OPLOG STATISTICS");
print("-".repeat(40));

// Switch to local database to examine oplog
const localDb = db.getSiblingDB("local");
const oplog = localDb.oplog.rs;

const oplogStats = oplog.stats();
print(`\nOplog Collection Size: ${(oplogStats.size / 1024 / 1024).toFixed(2)} MB`);
print(`Document Count: ${oplogStats.count}`);

// Get first and last oplog entries
const firstOp = oplog.find().sort({ $natural: 1 }).limit(1).toArray()[0];
const lastOp = oplog.find().sort({ $natural: -1 }).limit(1).toArray()[0];

if (firstOp && lastOp) {
  const oplogWindow = lastOp.ts.getTime() - firstOp.ts.getTime();
  print(`\nOplog Window:`);
  print(`  First Operation: ${firstOp.ts}`);
  print(`  Last Operation: ${lastOp.ts}`);
  print(`  Time Range: ${(oplogWindow / 3600).toFixed(2)} hours`);
}

// Recent operations
print("\nRecent Oplog Operations:");
const recentOps = oplog.find().sort({ $natural: -1 }).limit(5).toArray();
recentOps.forEach((op) => {
  print(`  ${op.ts} - ${op.op} on ${op.ns} (${op.o2 ? "update" : op.op})`);
});

// ========================================================================
// 5. Read and Write Concern Examples
// ========================================================================
print("\n5. READ/WRITE CONCERN OPERATIONS");
print("-".repeat(40));

// Switch to test database
use("lab05_replication");

// Write with different concerns
print("\nTesting Write Concerns:");

// Write with w:1 (primary only)
let result = db.test_collection.insertOne(
  { test: "w1", timestamp: new Date() },
  { writeConcern: { w: 1 } }
);
print(`  w:1 write - Acknowledged: ${result.acknowledged}`);

// Write with w:majority
result = db.test_collection.insertOne(
  { test: "wmajority", timestamp: new Date() },
  { writeConcern: { w: "majority", wtimeout: 5000 } }
);
print(`  w:majority write - Acknowledged: ${result.acknowledged}`);

// Write with w:2 (at least 2 members)
try {
  result = db.test_collection.insertOne(
    { test: "w2", timestamp: new Date() },
    { writeConcern: { w: 2, wtimeout: 5000 } }
  );
  print(`  w:2 write - Acknowledged: ${result.acknowledged}`);
} catch (e) {
  print(`  w:2 write - Error: ${e.message}`);
}

// Read with different preferences
print("\nTesting Read Preferences:");

// Primary read
const primaryCount = db.test_collection.find().readPref("primary").count();
print(`  Primary read - Count: ${primaryCount}`);

// Secondary read
const secondaryCount = db.test_collection.find().readPref("secondary").count();
print(`  Secondary read - Count: ${secondaryCount}`);

// Nearest read
const nearestCount = db.test_collection.find().readPref("nearest").count();
print(`  Nearest read - Count: ${nearestCount}`);

// ========================================================================
// 6. Failover Testing Commands
// ========================================================================
print("\n6. FAILOVER TESTING COMMANDS");
print("-".repeat(40));

print("\nUseful commands for testing failover:");
print("");
print("// Step down primary for 60 seconds:");
print("rs.stepDown(60)");
print("");
print("// Freeze a secondary (prevent it from becoming primary):");
print("rs.freeze(120)");
print("");
print("// Make a secondary ineligible for election temporarily:");
print("cfg = rs.conf()");
print("cfg.members[1].priority = 0");
print("rs.reconfig(cfg)");
print("");
print("// Force a member to sync from specific member:");
print("rs.syncFrom('localhost:27018')");

// ========================================================================
// 7. Maintenance Operations
// ========================================================================
print("\n7. MAINTENANCE OPERATIONS");
print("-".repeat(40));

print("\nCommon maintenance tasks:");

// Check if this is primary
const isMaster = db.isMaster();
if (isMaster.ismaster) {
  print("\n✓ Connected to PRIMARY - Can perform write operations");
} else {
  print("\n⚠ Connected to SECONDARY - Read-only mode");
  print("  To allow reads: rs.secondaryOk()");
}

print("\nMaintenance Commands:");
print("");
print("// Add a new member:");
print("rs.add('localhost:27020')");
print("");
print("// Remove a member:");
print("rs.remove('localhost:27020')");
print("");
print("// Reconfigure with new settings:");
print("cfg = rs.conf()");
print("cfg.settings.catchUpTimeoutMillis = 30000");
print("rs.reconfig(cfg)");
print("");
print("// Compact a collection on secondary:");
print("db.runCommand({ compact: 'collection_name' })");

// ========================================================================
// 8. Monitoring Queries
// ========================================================================
print("\n8. MONITORING QUERIES");
print("-".repeat(40));

// Server status
const serverStatus = db.serverStatus();

print("\nServer Metrics:");
print(`  Connections: ${serverStatus.connections.current}/${serverStatus.connections.available}`);
print(`  Network In: ${(serverStatus.network.bytesIn / 1024 / 1024).toFixed(2)} MB`);
print(`  Network Out: ${(serverStatus.network.bytesOut / 1024 / 1024).toFixed(2)} MB`);
print(`  Ops Counters:`);
print(`    Insert: ${serverStatus.opcounters.insert}`);
print(`    Query: ${serverStatus.opcounters.query}`);
print(`    Update: ${serverStatus.opcounters.update}`);
print(`    Delete: ${serverStatus.opcounters.delete}`);

// Replication metrics
if (serverStatus.repl) {
  print("\nReplication Metrics:");
  print(`  Replication State: ${serverStatus.repl.myState}`);

  if (serverStatus.repl.syncSourceHost) {
    print(`  Sync Source: ${serverStatus.repl.syncSourceHost}`);
  }

  if (serverStatus.metrics && serverStatus.metrics.repl) {
    const replMetrics = serverStatus.metrics.repl;
    print(`  Apply Batches: ${replMetrics.apply.batches.num}`);
    print(`  Apply Ops: ${replMetrics.apply.ops}`);
    print(`  Buffer Size: ${replMetrics.buffer.sizeBytes} bytes`);
    print(`  Network Bytes: ${replMetrics.network.bytes}`);
  }
}

// ========================================================================
// 9. Data Verification
// ========================================================================
print("\n9. DATA VERIFICATION");
print("-".repeat(40));

// Create test data on primary
print("\nCreating test document on primary...");
const testDoc = {
  _id: "reptest_" + new Date().getTime(),
  data: "Replication test",
  timestamp: new Date(),
};

db.replication_test.insertOne(testDoc, { writeConcern: { w: "majority" } });
print(`Created document: ${testDoc._id}`);

// Wait a moment for replication
sleep(1000);

// Check if document exists on secondaries
print("\nVerifying replication to secondaries:");

// Enable secondary reads
rs.secondaryOk();

const foundDoc = db.replication_test.findOne({ _id: testDoc._id });
if (foundDoc) {
  print(`✓ Document replicated successfully`);
  print(`  Data: ${foundDoc.data}`);
  print(`  Timestamp: ${foundDoc.timestamp}`);
} else {
  print(`✗ Document not found (may still be replicating)`);
}

// ========================================================================
// 10. Advanced Configuration Examples
// ========================================================================
print("\n10. ADVANCED CONFIGURATION EXAMPLES");
print("-".repeat(40));

print("\nExample: Configure a Hidden Secondary for Backups");
print("");
print("cfg = rs.conf()");
print("cfg.members[2].hidden = true");
print("cfg.members[2].priority = 0");
print("rs.reconfig(cfg)");

print("\nExample: Configure a Delayed Secondary (1 hour delay)");
print("");
print("cfg = rs.conf()");
print("cfg.members[2].priority = 0");
print("cfg.members[2].hidden = true");
print("cfg.members[2].secondaryDelaySecs = 3600");
print("rs.reconfig(cfg)");

print("\nExample: Configure Custom Write Concern");
print("");
print("cfg = rs.conf()");
print("cfg.settings = cfg.settings || {}");
print("cfg.settings.getLastErrorDefaults = { w: 'majority', j: true }");
print("rs.reconfig(cfg)");

print("\nExample: Add Tags for Data Center Awareness");
print("");
print("cfg = rs.conf()");
print("cfg.members[0].tags = { dc: 'east', use: 'production' }");
print("cfg.members[1].tags = { dc: 'east', use: 'analytics' }");
print("cfg.members[2].tags = { dc: 'west', use: 'backup' }");
print("rs.reconfig(cfg)");

// ========================================================================
// Summary
// ========================================================================
print("\n" + "=".repeat(60));
print("REPLICA SET SUMMARY");
print("=".repeat(60));

const summary = {
  primary: rsStatus.members.filter((m) => m.stateStr === "PRIMARY").length,
  secondary: rsStatus.members.filter((m) => m.stateStr === "SECONDARY").length,
  arbiter: rsStatus.members.filter((m) => m.stateStr === "ARBITER").length,
  other: rsStatus.members.filter((m) => !["PRIMARY", "SECONDARY", "ARBITER"].includes(m.stateStr))
    .length,
};

print(`\nTopology:`);
print(`  Primary: ${summary.primary}`);
print(`  Secondaries: ${summary.secondary}`);
print(`  Arbiters: ${summary.arbiter}`);
if (summary.other > 0) {
  print(`  Other: ${summary.other}`);
}

const healthy = rsStatus.members.filter((m) => m.health === 1).length;
print(`\nHealth: ${healthy}/${rsStatus.members.length} members healthy`);

if (healthy === rsStatus.members.length) {
  print("\n✓ Replica set is fully operational!");
} else {
  print("\n⚠ Some members are unhealthy - investigate!");
}

print("=".repeat(60));
