/**
 * Lab 05 - Write Concerns Demo (mongosh version)
 *
 * Demonstrates different write concerns in MongoDB replica sets.
 *
 * Usage: mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs" --file write_concerns_mongosh.js
 */

print("=" .repeat(60));
print("Lab 05 - MongoDB Write Concerns");
print("=" .repeat(60));

// Use test database
use('lab05_test');

// Clear test collection
db.write_test.drop();

// ========================================================================
// Write Concern Overview
// ========================================================================
print("\nWrite Concern Components:");
print("-".repeat(40));
print("  w: <number|'majority'>  - Number of acknowledgments");
print("  j: <boolean>            - Journal acknowledgment");
print("  wtimeout: <milliseconds> - Timeout for write concern");

// ========================================================================
// 1. Write Concern w:0 (Unacknowledged)
// ========================================================================
print("\n" + "=" .repeat(60));
print("1. Write Concern w:0 (Unacknowledged)");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Fire and forget");
print("  - No acknowledgment from server");
print("  - Fastest but least durable");
print("  - Use only for non-critical data");

print("\nTesting w:0...");
const startW0 = new Date();

try {
    for (let i = 1; i <= 100; i++) {
        db.write_test.insertOne(
            {
                type: "w0",
                value: i,
                timestamp: new Date(),
                message: `Unacknowledged write ${i}`
            },
            { writeConcern: { w: 0 } }
        );
    }
    const durationW0 = new Date() - startW0;
    print(`  ✓ Inserted 100 documents with w:0 in ${durationW0}ms`);
} catch (e) {
    print(`  ✗ Error with w:0: ${e}`);
}

// ========================================================================
// 2. Write Concern w:1 (Acknowledged - Default)
// ========================================================================
print("\n" + "=" .repeat(60));
print("2. Write Concern w:1 (Acknowledged - Default)");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Acknowledgment from primary");
print("  - Default write concern");
print("  - Balances performance and safety");
print("  - Data written to primary's memory");

print("\nTesting w:1...");
const startW1 = new Date();

try {
    const results = [];
    for (let i = 1; i <= 100; i++) {
        const result = db.write_test.insertOne(
            {
                type: "w1",
                value: i,
                timestamp: new Date(),
                message: `Primary acknowledged write ${i}`
            },
            { writeConcern: { w: 1 } }
        );
        results.push(result);
    }
    const durationW1 = new Date() - startW1;
    print(`  ✓ Inserted 100 documents with w:1 in ${durationW1}ms`);
    print(`  All ${results.length} writes acknowledged by primary`);
} catch (e) {
    print(`  ✗ Error with w:1: ${e}`);
}

// ========================================================================
// 3. Write Concern w:majority
// ========================================================================
print("\n" + "=" .repeat(60));
print("3. Write Concern w:majority");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Acknowledgment from majority of replica set");
print("  - Survives primary failover");
print("  - Stronger durability guarantee");
print("  - Higher latency than w:1");

print("\nTesting w:majority...");
const startWMajority = new Date();

try {
    const results = [];
    for (let i = 1; i <= 50; i++) {  // Fewer documents due to higher latency
        const result = db.write_test.insertOne(
            {
                type: "wmajority",
                value: i,
                timestamp: new Date(),
                message: `Majority acknowledged write ${i}`
            },
            { writeConcern: { w: "majority", wtimeout: 5000 } }
        );
        results.push(result);
    }
    const durationWMajority = new Date() - startWMajority;
    print(`  ✓ Inserted 50 documents with w:majority in ${durationWMajority}ms`);
    print(`  Average: ${(durationWMajority / 50).toFixed(2)}ms per write`);
} catch (e) {
    print(`  ✗ Error with w:majority: ${e}`);
}

// ========================================================================
// 4. Write Concern w:2 or w:3 (Specific Number)
// ========================================================================
print("\n" + "=" .repeat(60));
print("4. Write Concern w:2 and w:3 (Specific Number)");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Acknowledgment from specific number of nodes");
print("  - w:2 = primary + 1 secondary");
print("  - w:3 = primary + 2 secondaries (all nodes)");
print("  - Precise control over durability");

print("\nTesting w:2...");
const startW2 = new Date();

try {
    const resultW2 = [];
    for (let i = 1; i <= 20; i++) {
        const result = db.write_test.insertOne(
            {
                type: "w2",
                value: i,
                timestamp: new Date(),
                message: `Two node acknowledged write ${i}`
            },
            { writeConcern: { w: 2, wtimeout: 5000 } }
        );
        resultW2.push(result);
    }
    const durationW2 = new Date() - startW2;
    print(`  ✓ Inserted 20 documents with w:2 in ${durationW2}ms`);
} catch (e) {
    print(`  ✗ Error with w:2: ${e}`);
}

print("\nTesting w:3 (all replica set members)...");
const startW3 = new Date();

try {
    const resultW3 = [];
    for (let i = 1; i <= 10; i++) {
        const result = db.write_test.insertOne(
            {
                type: "w3",
                value: i,
                timestamp: new Date(),
                message: `All nodes acknowledged write ${i}`
            },
            { writeConcern: { w: 3, wtimeout: 5000 } }
        );
        resultW3.push(result);
    }
    const durationW3 = new Date() - startW3;
    print(`  ✓ Inserted 10 documents with w:3 in ${durationW3}ms`);
    print(`  All 3 replica set members acknowledged every write`);
} catch (e) {
    print(`  ✗ Error with w:3: ${e}`);
}

// ========================================================================
// 5. Write Concern with Journal (j:true)
// ========================================================================
print("\n" + "=" .repeat(60));
print("5. Write Concern with Journal (j:true)");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Ensures write is in on-disk journal");
print("  - Survives server crash/power loss");
print("  - Higher latency than memory-only");
print("  - Maximum durability");

print("\nTesting w:majority with j:true...");
const startWMajorityJ = new Date();

try {
    const results = [];
    for (let i = 1; i <= 20; i++) {
        const result = db.write_test.insertOne(
            {
                type: "wmajority-journal",
                value: i,
                timestamp: new Date(),
                message: `Majority + journal write ${i}`
            },
            { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
        );
        results.push(result);
    }
    const durationWMajorityJ = new Date() - startWMajorityJ;
    print(`  ✓ Inserted 20 documents with w:majority, j:true in ${durationWMajorityJ}ms`);
    print(`  Maximum durability: majority replicated + journaled`);
} catch (e) {
    print(`  ✗ Error with w:majority, j:true: ${e}`);
}

// ========================================================================
// 6. Write Concern with Timeout
// ========================================================================
print("\n" + "=" .repeat(60));
print("6. Write Concern with Timeout");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - wtimeout prevents indefinite blocking");
print("  - Returns error if timeout exceeded");
print("  - Write may still succeed after timeout");
print("  - Important for application responsiveness");

print("\nTesting with short timeout (may fail)...");

try {
    // Intentionally short timeout to demonstrate timeout behavior
    const result = db.write_test.insertOne(
        {
            type: "timeout-test",
            timestamp: new Date(),
            message: "Testing timeout behavior"
        },
        { writeConcern: { w: 3, wtimeout: 100 } }  // 100ms timeout
    );
    print("  ✓ Write succeeded within timeout (insertedId: " + result.insertedId + ")");
} catch (e) {
    if (e.toString().includes("timeout")) {
        print(`  ⚠ Write timed out as expected: ${e}`);
        print("  Note: The write may still complete eventually");
    } else {
        print(`  ✗ Unexpected error: ${e}`);
    }
}

// ========================================================================
// 7. Performance Comparison
// ========================================================================
print("\n" + "=" .repeat(60));
print("7. Performance Comparison");
print("-".repeat(40));

print("\nComparing write concern performance...");

function benchmarkWriteConcern(writeConcern, label, count = 50) {
    const docs = [];
    for (let i = 0; i < count; i++) {
        docs.push({
            benchmark: label,
            index: i,
            timestamp: new Date(),
            data: "x".repeat(1000)  // 1KB of data
        });
    }

    const start = new Date();
    try {
        db.benchmark.insertMany(docs, { writeConcern: writeConcern });
        const duration = new Date() - start;
        const avgMs = (duration / count).toFixed(2);
        print(`  ${label.padEnd(25)}: ${duration}ms total, ${avgMs}ms avg`);
        return duration;
    } catch (e) {
        print(`  ${label.padEnd(25)}: Failed - ${e}`);
        return -1;
    }
}

db.benchmark.drop();

benchmarkWriteConcern({ w: 0 }, "w:0 (unacknowledged)");
benchmarkWriteConcern({ w: 1 }, "w:1 (primary)");
benchmarkWriteConcern({ w: 2 }, "w:2 (primary + 1)");
benchmarkWriteConcern({ w: "majority" }, "w:majority");
benchmarkWriteConcern({ w: "majority", j: true }, "w:majority, j:true");

// ========================================================================
// 8. Simulating Failure Scenarios
// ========================================================================
print("\n" + "=" .repeat(60));
print("8. Failure Scenario Testing");
print("-".repeat(40));

print("\nScenario: Primary fails during write");
print("To test manually:");
print("1. Start a write with w:majority");
print("2. Kill primary during write");
print("3. Observe behavior based on write concern");

print("\nExpected outcomes:");
print("  w:0  -> No error (fire and forget)");
print("  w:1  -> Error (primary unavailable)");
print("  w:majority -> May succeed if majority reached before failure");
print("  w:3  -> Will fail (not enough nodes)");

// ========================================================================
// 9. Custom Write Concern
// ========================================================================
print("\n" + "=" .repeat(60));
print("9. Custom Write Concern");
print("-".repeat(40));

print("\nYou can create custom write concerns at replica set level:");
print("\nExample: Create 'important' write concern");
print("  cfg = rs.conf()");
print("  cfg.settings = cfg.settings || {}");
print("  cfg.settings.getLastErrorDefaults = { w: 'majority', j: true, wtimeout: 5000 }");
print("  rs.reconfig(cfg)");

print("\nThen use it in your application:");
print("  db.collection.insertOne(doc, { writeConcern: 'important' })");

// ========================================================================
// Summary and Best Practices
// ========================================================================
print("\n" + "=" .repeat(60));
print("Write Concern Best Practices");
print("=" .repeat(60));

const recommendations = [
    {
        useCase: "Session data / Caching",
        writeConcern: "w:0 or w:1",
        reason: "Speed over durability"
    },
    {
        useCase: "User-generated content",
        writeConcern: "w:majority",
        reason: "Balance of durability and performance"
    },
    {
        useCase: "Financial transactions",
        writeConcern: "w:majority, j:true",
        reason: "Maximum durability required"
    },
    {
        useCase: "Audit logs",
        writeConcern: "w:majority, j:true",
        reason: "Must not lose data"
    },
    {
        useCase: "Real-time analytics",
        writeConcern: "w:1",
        reason: "Low latency important"
    }
];

print("\nRecommended write concerns by use case:\n");
recommendations.forEach((rec, i) => {
    print(`${i + 1}. ${rec.useCase}`);
    print(`   Use: ${rec.writeConcern}`);
    print(`   Why: ${rec.reason}\n`);
});

// Final statistics
print("=" .repeat(60));
print("Test Summary");
print("-".repeat(40));

const totalDocs = db.write_test.countDocuments();
const byType = db.write_test.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
]).toArray();

print(`\nTotal documents written: ${totalDocs}`);
print("\nBreakdown by write concern:");
byType.forEach(type => {
    print(`  ${type._id}: ${type.count} documents`);
});

print("\n✓ Write concerns demonstration complete!");
print("=" .repeat(60));
