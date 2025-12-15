/**
 * Lab 05 - Read Preferences Demo (mongosh version)
 *
 * Demonstrates different read preferences in MongoDB replica sets.
 *
 * Usage: mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs" --file read_preferences_mongosh.js
 */

print("=" .repeat(60));
print("Lab 05 - MongoDB Read Preferences");
print("=" .repeat(60));

// Use test database
use('lab05_test');

// Helper function to get current member info
function getCurrentMember() {
    const status = db.serverStatus();
    const repl = status.repl;

    if (repl) {
        return {
            host: repl.me || status.host,
            isPrimary: repl.ismaster,
            isSecondary: repl.secondary
        };
    }
    return { host: "unknown", isPrimary: false, isSecondary: false };
}

const initialMember = getCurrentMember();
print(`Connected to: ${initialMember.host} (primary: ${initialMember.isPrimary}, secondary: ${initialMember.isSecondary})`);

// ========================================================================
// Setup Test Data
// ========================================================================
print("\nSetting up test data...");

// Clear existing data
db.read_test.drop();

// Insert test documents (only on primary)
const testDocs = [];
for (let i = 1; i <= 100; i++) {
    testDocs.push({
        _id: i,
        category: i <= 33 ? "A" : i <= 66 ? "B" : "C",
        value: Math.floor(Math.random() * 1000),
        timestamp: new Date(),
        description: `Document ${i}`
    });
}

db.read_test.insertMany(testDocs);
print(`✓ Inserted ${testDocs.length} test documents`);

// ========================================================================
// 1. Primary Read Preference (Default)
// ========================================================================
print("\n" + "=" .repeat(60));
print("1. PRIMARY Read Preference (Default)");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Reads only from primary");
print("  - Guarantees read-your-own-write consistency");
print("  - Fails if no primary available");

// Connect with primary preference
const primaryConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=primary");
const primaryDb = primaryConn.getDB("lab05_test");

print("\nExecuting read with PRIMARY preference:");
const primaryResult = primaryDb.read_test.find({ category: "A" }).limit(5).toArray();
print(`  Found ${primaryResult.length} documents from category A`);

const primaryServer = primaryDb.runCommand({ isMaster: 1 });
print(`  Read from: ${primaryServer.primary}`);

// ========================================================================
// 2. Secondary Read Preference
// ========================================================================
print("\n" + "=" .repeat(60));
print("2. SECONDARY Read Preference");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Reads only from secondaries");
print("  - Distributes read load");
print("  - May return stale data");
print("  - Fails if no secondaries available");

// Connect with secondary preference
const secondaryConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=secondary");
const secondaryDb = secondaryConn.getDB("lab05_test");

// Enable secondary reads for this session
secondaryDb.getMongo().setSecondaryOk();

print("\nExecuting read with SECONDARY preference:");
const secondaryResult = secondaryDb.read_test.find({ category: "B" }).limit(5).toArray();
print(`  Found ${secondaryResult.length} documents from category B`);

// Note: In mongosh, we can't easily determine which specific secondary was used
print("  Read from: One of the secondary nodes");

// ========================================================================
// 3. Secondary Preferred Read Preference
// ========================================================================
print("\n" + "=" .repeat(60));
print("3. SECONDARY PREFERRED Read Preference");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Prefers secondaries but falls back to primary");
print("  - Good for read-heavy workloads");
print("  - Tolerates secondary unavailability");

// Connect with secondaryPreferred preference
const secPrefConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=secondaryPreferred");
const secPrefDb = secPrefConn.getDB("lab05_test");

print("\nExecuting read with SECONDARY PREFERRED preference:");
const secPrefResult = secPrefDb.read_test.find({ category: "C" }).limit(5).toArray();
print(`  Found ${secPrefResult.length} documents from category C`);
print("  Read from: Secondary if available, otherwise primary");

// ========================================================================
// 4. Nearest Read Preference
// ========================================================================
print("\n" + "=" .repeat(60));
print("4. NEAREST Read Preference");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Reads from member with lowest network latency");
print("  - Good for geographically distributed deployments");
print("  - Can read from primary or secondary");

// Connect with nearest preference
const nearestConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=nearest");
const nearestDb = nearestConn.getDB("lab05_test");

print("\nExecuting read with NEAREST preference:");
const nearestResult = nearestDb.read_test.find({ value: { $gte: 500 } }).limit(5).toArray();
print(`  Found ${nearestResult.length} documents with value >= 500`);
print("  Read from: Member with lowest network latency");

// ========================================================================
// 5. Primary Preferred Read Preference
// ========================================================================
print("\n" + "=" .repeat(60));
print("5. PRIMARY PREFERRED Read Preference");
print("-".repeat(40));

print("\nCharacteristics:");
print("  - Prefers primary but falls back to secondaries");
print("  - Good when consistency is preferred but not required");
print("  - Maintains availability during primary unavailability");

// Connect with primaryPreferred preference
const primPrefConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=primaryPreferred");
const primPrefDb = primPrefConn.getDB("lab05_test");

print("\nExecuting read with PRIMARY PREFERRED preference:");
const primPrefResult = primPrefDb.read_test.find().limit(5).toArray();
print(`  Found ${primPrefResult.length} documents`);
print("  Read from: Primary if available, otherwise secondary");

// ========================================================================
// 6. Read Preference with Tags
// ========================================================================
print("\n" + "=" .repeat(60));
print("6. Read Preference with Tag Sets");
print("-".repeat(40));

print("\nTag sets allow targeting specific replica set members");
print("Example: Reading from specific data center or region");

print("\nTo configure tags:");
print("1. Add tags to replica set members:");
print("   cfg = rs.conf()");
print("   cfg.members[0].tags = { dc: 'us-east', usage: 'production' }");
print("   cfg.members[1].tags = { dc: 'us-west', usage: 'analytics' }");
print("   rs.reconfig(cfg)");

print("\n2. Use tags in read preference:");
print("   db.getMongo().setReadPref('secondary', [{ dc: 'us-west' }])");

// ========================================================================
// 7. Testing Consistency Levels
// ========================================================================
print("\n" + "=" .repeat(60));
print("7. Testing Consistency Levels");
print("-".repeat(40));

print("\nInserting document on PRIMARY...");
const testId = new ObjectId();
db.consistency_test.insertOne({
    _id: testId,
    timestamp: new Date(),
    message: "Testing read consistency"
});

print("\nImmediate read from PRIMARY:");
const primaryRead = db.consistency_test.findOne({ _id: testId });
print(`  Found: ${primaryRead ? "YES" : "NO"}`);

print("\nImmediate read from SECONDARY (may not be replicated yet):");
secondaryDb.getMongo().setSecondaryOk();
const secondaryRead = secondaryDb.consistency_test.findOne({ _id: testId });
print(`  Found: ${secondaryRead ? "YES" : "NO"}`);

if (!secondaryRead) {
    print("\nWaiting 1 second for replication...");
    sleep(1000);

    const secondaryReadRetry = secondaryDb.consistency_test.findOne({ _id: testId });
    print(`  Found after wait: ${secondaryReadRetry ? "YES" : "NO"}`);
}

// ========================================================================
// 8. Performance Comparison
// ========================================================================
print("\n" + "=" .repeat(60));
print("8. Performance Comparison");
print("-".repeat(40));

print("\nRunning performance test with different read preferences...");

function performanceTest(readPref, label) {
    const conn = new Mongo(`mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=${readPref}`);
    const testDb = conn.getDB("lab05_test");

    const startTime = new Date();
    let count = 0;

    // Run 100 queries
    for (let i = 0; i < 100; i++) {
        const result = testDb.read_test.findOne({ _id: Math.floor(Math.random() * 100) + 1 });
        if (result) count++;
    }

    const duration = new Date() - startTime;

    print(`  ${label.padEnd(20)}: ${duration}ms for 100 queries (${count} found)`);
    return duration;
}

performanceTest("primary", "PRIMARY");
performanceTest("secondary", "SECONDARY");
performanceTest("nearest", "NEAREST");

// ========================================================================
// Summary
// ========================================================================
print("\n" + "=" .repeat(60));
print("Read Preference Best Practices");
print("=" .repeat(60));

const practices = [
    {
        scenario: "Real-time analytics dashboard",
        preference: "PRIMARY",
        reason: "Ensures latest data"
    },
    {
        scenario: "Historical reporting",
        preference: "SECONDARY",
        reason: "Offloads primary, stale data acceptable"
    },
    {
        scenario: "Global application",
        preference: "NEAREST",
        reason: "Minimizes latency"
    },
    {
        scenario: "Read-heavy workload",
        preference: "SECONDARY PREFERRED",
        reason: "Distributes load, maintains availability"
    },
    {
        scenario: "Critical reads with HA",
        preference: "PRIMARY PREFERRED",
        reason: "Prefers consistency but maintains availability"
    }
];

print("\nRecommended read preferences by scenario:\n");
practices.forEach((p, i) => {
    print(`${i + 1}. ${p.scenario}`);
    print(`   Use: ${p.preference}`);
    print(`   Why: ${p.reason}\n`);
});

print("=" .repeat(60));
print("✓ Read preferences demonstration complete!");
print("=" .repeat(60));
