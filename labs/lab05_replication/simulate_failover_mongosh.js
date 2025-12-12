/**
 * Lab 05 - Simulate Failover (mongosh version)
 *
 * This script demonstrates failover scenarios in a replica set.
 * Run after setting up the replica set.
 *
 * Usage: mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs" --file simulate_failover_mongosh.js
 */

print("=" .repeat(60));
print("Lab 05 - Replica Set Failover Simulation");
print("=" .repeat(60));

// Helper function to check primary
function checkPrimary() {
    const status = rs.status();
    const primary = status.members.find(m => m.stateStr === "PRIMARY");

    if (primary) {
        print(`Current PRIMARY: ${primary.name}`);
        return primary.name;
    } else {
        print("No PRIMARY found!");
        return null;
    }
}

// Helper function to wait for condition
function waitFor(conditionFunc, timeoutMs = 30000, intervalMs = 1000) {
    const startTime = new Date().getTime();

    while (new Date().getTime() - startTime < timeoutMs) {
        if (conditionFunc()) {
            return true;
        }
        sleep(intervalMs);
    }

    return false;
}

// ========================================================================
// Scenario 1: Graceful Step Down
// ========================================================================
print("\n" + "=" .repeat(60));
print("Scenario 1: Graceful Step Down");
print("-".repeat(40));

print("\nCurrent replica set status:");
const initialPrimary = checkPrimary();

if (initialPrimary) {
    print("\nForcing primary to step down for 60 seconds...");

    try {
        rs.stepDown(60);
        print("Step down command issued successfully");
    } catch (e) {
        print("Expected error during step down: " + e);
    }

    print("\nWaiting for new primary election...");
    sleep(5000); // Wait 5 seconds for election

    const newPrimary = checkPrimary();

    if (newPrimary && newPrimary !== initialPrimary) {
        print(`✓ Failover successful! New primary: ${newPrimary}`);
    } else {
        print("✗ Failover may not have completed yet");
    }
}

// ========================================================================
// Scenario 2: Priority-based Election
// ========================================================================
print("\n" + "=" .repeat(60));
print("Scenario 2: Priority-based Election");
print("-".repeat(40));

print("\nCurrent configuration:");
const config = rs.conf();
config.members.forEach(member => {
    print(`  ${member.host} - Priority: ${member.priority || 1}`);
});

print("\nModifying priorities to influence election:");
print("  Setting localhost:27017 priority to 10");
print("  Setting localhost:27018 priority to 5");
print("  Setting localhost:27019 priority to 1");

// Modify configuration
config.version++;
config.members[0].priority = 10; // localhost:27017
config.members[1].priority = 5;  // localhost:27018
config.members[2].priority = 1;  // localhost:27019

print("\nReconfiguring replica set...");
try {
    rs.reconfig(config);
    print("✓ Reconfiguration successful");

    print("\nWaiting for election based on new priorities...");
    sleep(10000); // Wait 10 seconds

    const primaryAfterReconfig = checkPrimary();
    print(`Primary after reconfig: ${primaryAfterReconfig}`);

    if (primaryAfterReconfig === "localhost:27017") {
        print("✓ Highest priority node became primary as expected");
    }
} catch (e) {
    print("Error during reconfiguration: " + e);
}

// ========================================================================
// Scenario 3: Network Partition Simulation
// ========================================================================
print("\n" + "=" .repeat(60));
print("Scenario 3: Network Partition Simulation");
print("-".repeat(40));

print("\nNOTE: Network partition requires manual intervention");
print("To simulate network partition:");
print("1. Block network access to primary (firewall rules or disconnect)");
print("2. Observe automatic failover to secondary");
print("3. Restore network to see recovery");

print("\nExample commands (run in separate terminal):");
print("  # Block port 27017 (simulate primary network failure)");
print("  sudo iptables -A INPUT -p tcp --dport 27017 -j DROP");
print("  ");
print("  # Wait for failover, then restore:");
print("  sudo iptables -D INPUT -p tcp --dport 27017 -j DROP");

// ========================================================================
// Scenario 4: Write Concern During Failover
// ========================================================================
print("\n" + "=" .repeat(60));
print("Scenario 4: Write Concern During Failover");
print("-".repeat(40));

use('lab05_test');

print("\nTesting writes with different write concerns during failover:");

// Test with w:1 (acknowledge from primary only)
print("\n1. Testing with w:1 (primary acknowledgment only):");
try {
    const result1 = db.failover_test.insertOne(
        {
            test: "w1",
            timestamp: new Date(),
            message: "Write with w:1 during stable state"
        },
        { writeConcern: { w: 1, wtimeout: 5000 } }
    );
    print("  ✓ Write with w:1 succeeded");
} catch (e) {
    print("  ✗ Write with w:1 failed: " + e);
}

// Test with w:majority
print("\n2. Testing with w:majority (majority acknowledgment):");
try {
    const result2 = db.failover_test.insertOne(
        {
            test: "wmajority",
            timestamp: new Date(),
            message: "Write with w:majority during stable state"
        },
        { writeConcern: { w: "majority", wtimeout: 5000 } }
    );
    print("  ✓ Write with w:majority succeeded");
} catch (e) {
    print("  ✗ Write with w:majority failed: " + e);
}

// Test with w:3 (all members)
print("\n3. Testing with w:3 (all members acknowledgment):");
try {
    const result3 = db.failover_test.insertOne(
        {
            test: "w3",
            timestamp: new Date(),
            message: "Write with w:3 during stable state"
        },
        { writeConcern: { w: 3, wtimeout: 5000 } }
    );
    print("  ✓ Write with w:3 succeeded (all members available)");
} catch (e) {
    print("  ✗ Write with w:3 failed: " + e);
}

// ========================================================================
// Scenario 5: Read Preferences During Failover
// ========================================================================
print("\n" + "=" .repeat(60));
print("Scenario 5: Read Preferences During Failover");
print("-".repeat(40));

print("\nTesting different read preferences:");

// Test primary read preference
print("\n1. Reading from PRIMARY:");
try {
    const primaryConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=primary");
    const primaryDb = primaryConn.getDB("lab05_test");
    const count1 = primaryDb.products.countDocuments();
    print(`  ✓ Read from primary successful: ${count1} documents`);
} catch (e) {
    print("  ✗ Read from primary failed: " + e);
}

// Test secondary read preference
print("\n2. Reading from SECONDARY:");
try {
    const secondaryConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=secondary");
    const secondaryDb = secondaryConn.getDB("lab05_test");
    const count2 = secondaryDb.products.countDocuments();
    print(`  ✓ Read from secondary successful: ${count2} documents`);
} catch (e) {
    print("  ✗ Read from secondary failed: " + e);
}

// Test nearest read preference
print("\n3. Reading from NEAREST:");
try {
    const nearestConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=nearest");
    const nearestDb = nearestConn.getDB("lab05_test");
    const count3 = nearestDb.products.countDocuments();
    print(`  ✓ Read from nearest successful: ${count3} documents`);
} catch (e) {
    print("  ✗ Read from nearest failed: " + e);
}

// ========================================================================
// Scenario 6: Monitoring Replication Lag
// ========================================================================
print("\n" + "=" .repeat(60));
print("Scenario 6: Monitoring Replication Lag");
print("-".repeat(40));

print("\nChecking replication lag:");
rs.printSecondaryReplicationInfo();

print("\nOplog information:");
rs.printReplicationInfo();

// ========================================================================
// Summary
// ========================================================================
print("\n" + "=" .repeat(60));
print("Failover Simulation Summary");
print("=" .repeat(60));

const finalStatus = rs.status();
print("\nFinal replica set state:");
finalStatus.members.forEach(member => {
    print(`  ${member.name}: ${member.stateStr} (Health: ${member.health})`);
});

print("\nKey observations:");
print("1. Automatic failover occurs when primary becomes unavailable");
print("2. Election takes 10-30 seconds typically");
print("3. Write concern affects durability during failover");
print("4. Read preferences determine which nodes can serve reads");
print("5. Priority settings influence election outcomes");

print("\n✓ Failover simulation complete!");
print("=" .repeat(60));