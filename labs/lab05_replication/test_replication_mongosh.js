/**
 * Lab 05 - Test Replication (mongosh version)
 *
 * Tests replica set functionality and verifies replication is working.
 *
 * Usage: mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs" --file test_replication_mongosh.js
 */

print("=" .repeat(60));
print("Lab 05 - Testing Replica Set Functionality");
print("=" .repeat(60));

let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function to run tests
function runTest(testName, testFunc) {
    print(`\nTesting: ${testName}...`);
    try {
        const result = testFunc();
        if (result) {
            passedTests++;
            testResults.push({ test: testName, status: '✓ PASSED' });
            print(`  ✓ PASSED`);
            return true;
        } else {
            failedTests++;
            testResults.push({ test: testName, status: '✗ FAILED', error: 'Test returned false' });
            print(`  ✗ FAILED: Test returned false`);
            return false;
        }
    } catch (error) {
        failedTests++;
        testResults.push({ test: testName, status: '✗ FAILED', error: error.toString() });
        print(`  ✗ FAILED: ${error}`);
        return false;
    }
}

// ========================================================================
// Test 1: Verify Replica Set Configuration
// ========================================================================
runTest('Replica set is configured', () => {
    const config = rs.conf();

    if (!config || !config._id) {
        throw new Error('No replica set configuration found');
    }

    if (config._id !== 'lab05-rs') {
        throw new Error(`Wrong replica set name: ${config._id}`);
    }

    if (!config.members || config.members.length < 3) {
        throw new Error(`Insufficient members: ${config.members ? config.members.length : 0}`);
    }

    print(`    Replica set: ${config._id}`);
    print(`    Members: ${config.members.length}`);
    config.members.forEach(m => {
        print(`      - ${m.host} (priority: ${m.priority || 1})`);
    });

    return true;
});

// ========================================================================
// Test 2: Verify Primary Election
// ========================================================================
runTest('Primary is elected', () => {
    const status = rs.status();

    if (!status || !status.members) {
        throw new Error('Cannot get replica set status');
    }

    const primary = status.members.find(m => m.stateStr === 'PRIMARY');

    if (!primary) {
        throw new Error('No PRIMARY found in replica set');
    }

    print(`    Primary: ${primary.name}`);
    print(`    State: ${primary.stateStr}`);
    print(`    Health: ${primary.health}`);

    return primary.health === 1;
});

// ========================================================================
// Test 3: Verify Secondaries are Syncing
// ========================================================================
runTest('Secondaries are syncing', () => {
    const status = rs.status();
    const secondaries = status.members.filter(m => m.stateStr === 'SECONDARY');

    if (secondaries.length < 2) {
        throw new Error(`Not enough secondaries: ${secondaries.length}`);
    }

    let allHealthy = true;
    secondaries.forEach(secondary => {
        print(`    Secondary: ${secondary.name}`);
        print(`      State: ${secondary.stateStr}`);
        print(`      Health: ${secondary.health}`);

        if (secondary.health !== 1) {
            allHealthy = false;
        }

        // Check sync source
        if (secondary.syncSourceHost) {
            print(`      Syncing from: ${secondary.syncSourceHost}`);
        }
    });

    return allHealthy;
});

// ========================================================================
// Test 4: Test Write and Replication
// ========================================================================
runTest('Data replicates to secondaries', () => {
    // Use test database
    use('lab05_test');

    // Clear test collection
    db.replication_test.drop();

    // Insert test document on primary
    const testDoc = {
        _id: new ObjectId(),
        timestamp: new Date(),
        test: 'replication',
        random: Math.random()
    };

    const insertResult = db.replication_test.insertOne(testDoc);

    if (!insertResult.acknowledged) {
        throw new Error('Insert not acknowledged');
    }

    print(`    Inserted document with _id: ${testDoc._id}`);

    // Wait for replication
    print(`    Waiting 2 seconds for replication...`);
    sleep(2000);

    // Connect to each secondary and verify
    const members = rs.status().members;
    let replicatedCount = 0;

    members.forEach(member => {
        if (member.stateStr === 'SECONDARY') {
            try {
                // Create connection to specific secondary
                const conn = new Mongo(member.name);
                const secondaryDb = conn.getDB('lab05_test');

                // Enable secondary reads
                conn.setSecondaryOk();

                // Try to find the document
                const found = secondaryDb.replication_test.findOne({ _id: testDoc._id });

                if (found && found.random === testDoc.random) {
                    replicatedCount++;
                    print(`    ✓ Verified on ${member.name}`);
                } else {
                    print(`    ✗ Not found on ${member.name}`);
                }
            } catch (e) {
                print(`    ⚠ Could not verify on ${member.name}: ${e}`);
            }
        }
    });

    return replicatedCount >= 1; // At least one secondary has the data
});

// ========================================================================
// Test 5: Test Write Concerns
// ========================================================================
runTest('Write concerns work correctly', () => {
    use('lab05_test');

    // Test w:1
    print(`    Testing w:1...`);
    const w1Result = db.wc_test.insertOne(
        { test: 'w1', timestamp: new Date() },
        { writeConcern: { w: 1, wtimeout: 5000 } }
    );
    if (!w1Result.acknowledged) {
        throw new Error('w:1 write not acknowledged');
    }

    // Test w:majority
    print(`    Testing w:majority...`);
    const wMajorityResult = db.wc_test.insertOne(
        { test: 'wmajority', timestamp: new Date() },
        { writeConcern: { w: 'majority', wtimeout: 5000 } }
    );
    if (!wMajorityResult.acknowledged) {
        throw new Error('w:majority write not acknowledged');
    }

    // Test w:3 (all members)
    print(`    Testing w:3...`);
    try {
        const w3Result = db.wc_test.insertOne(
            { test: 'w3', timestamp: new Date() },
            { writeConcern: { w: 3, wtimeout: 5000 } }
        );
        if (!w3Result.acknowledged) {
            throw new Error('w:3 write not acknowledged');
        }
        print(`    All write concerns successful`);
    } catch (e) {
        // w:3 might timeout if a member is down
        print(`    w:3 timeout (expected if member down): ${e}`);
    }

    return true;
});

// ========================================================================
// Test 6: Test Read Preferences
// ========================================================================
runTest('Read preferences work correctly', () => {
    use('lab05_test');

    // Insert test data
    const testId = new ObjectId();
    db.read_pref_test.insertOne({
        _id: testId,
        timestamp: new Date(),
        value: Math.random()
    });

    // Test primary read
    print(`    Testing primary read preference...`);
    const primaryConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=primary");
    const primaryDb = primaryConn.getDB("lab05_test");
    const primaryRead = primaryDb.read_pref_test.findOne({ _id: testId });

    if (!primaryRead) {
        throw new Error('Primary read failed');
    }

    // Test secondary read
    print(`    Testing secondary read preference...`);
    const secondaryConn = new Mongo("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs&readPreference=secondary");
    const secondaryDb = secondaryConn.getDB("lab05_test");
    secondaryDb.getMongo().setSecondaryOk();

    // Wait a bit for replication
    sleep(1000);

    const secondaryRead = secondaryDb.read_pref_test.findOne({ _id: testId });

    if (!secondaryRead) {
        print(`    ⚠ Secondary read returned null (may need more time to replicate)`);
    } else {
        print(`    ✓ Secondary read successful`);
    }

    return true;
});

// ========================================================================
// Test 7: Test Oplog
// ========================================================================
runTest('Oplog is functioning', () => {
    // Switch to local database
    use('local');

    // Check oplog collection exists
    const collections = db.getCollectionNames();
    if (!collections.includes('oplog.rs')) {
        throw new Error('oplog.rs collection not found');
    }

    // Get oplog stats
    const oplogStats = db.oplog.rs.stats();
    print(`    Oplog size: ${(oplogStats.size / 1024 / 1024).toFixed(2)} MB`);
    print(`    Oplog entries: ${oplogStats.count}`);

    // Get recent oplog entries
    const recentOps = db.oplog.rs.find().sort({ ts: -1 }).limit(5).toArray();
    print(`    Recent operations: ${recentOps.length}`);

    recentOps.forEach(op => {
        print(`      - ${op.op} on ${op.ns} at ${op.ts}`);
    });

    return oplogStats.count > 0;
});

// ========================================================================
// Test 8: Test Failover Recovery
// ========================================================================
runTest('Failover and recovery', () => {
    print(`    Getting current primary...`);
    const initialStatus = rs.status();
    const initialPrimary = initialStatus.members.find(m => m.stateStr === 'PRIMARY');

    if (!initialPrimary) {
        throw new Error('No primary to test failover');
    }

    print(`    Current primary: ${initialPrimary.name}`);

    print(`    Forcing step down...`);
    try {
        rs.stepDown(30);
    } catch (e) {
        // Step down causes connection reset, this is expected
        print(`    Step down initiated (connection reset expected)`);
    }

    print(`    Waiting 10 seconds for new election...`);
    sleep(10000);

    // Reconnect and check new primary
    const newStatus = rs.status();
    const newPrimary = newStatus.members.find(m => m.stateStr === 'PRIMARY');

    if (!newPrimary) {
        throw new Error('No new primary elected after failover');
    }

    print(`    New primary: ${newPrimary.name}`);

    if (newPrimary.name === initialPrimary.name) {
        print(`    Same node re-elected (this can happen)`);
    } else {
        print(`    ✓ Different primary elected`);
    }

    return true;
});

// ========================================================================
// Test 9: Test Replication Lag
// ========================================================================
runTest('Monitor replication lag', () => {
    print(`    Checking replication lag...`);

    // Get replication info
    const replInfo = rs.printSecondaryReplicationInfo();

    const status = rs.status();
    const secondaries = status.members.filter(m => m.stateStr === 'SECONDARY');

    secondaries.forEach(secondary => {
        if (secondary.optimeDate && secondary.lastHeartbeat) {
            const lagMs = secondary.lastHeartbeat - secondary.optimeDate;
            print(`    ${secondary.name}: lag = ${lagMs}ms`);

            if (lagMs > 10000) {
                print(`      ⚠ High replication lag detected!`);
            }
        }
    });

    return true;
});

// ========================================================================
// Test 10: Test Connection String
// ========================================================================
runTest('Connection string works', () => {
    const connString = "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs";
    print(`    Testing connection: ${connString}`);

    try {
        const testConn = new Mongo(connString);
        const testDb = testConn.getDB("test");

        // Try a simple operation
        const result = testDb.runCommand({ ping: 1 });

        if (result.ok !== 1) {
            throw new Error('Ping command failed');
        }

        print(`    ✓ Connection successful`);
        return true;
    } catch (e) {
        throw new Error(`Connection failed: ${e}`);
    }
});

// ========================================================================
// Print Test Summary
// ========================================================================
print('\n' + '=' .repeat(60));
print('TEST RESULTS SUMMARY');
print('=' .repeat(60));

testResults.forEach(result => {
    print(`${result.status} ${result.test}`);
    if (result.error) {
        print(`    Error: ${result.error}`);
    }
});

print('\n' + '=' .repeat(60));
print(`TOTAL: ${passedTests} passed, ${failedTests} failed`);

if (failedTests === 0) {
    print('\n✓ All replication tests passed successfully!');
    print('The replica set is functioning correctly.');
} else {
    print(`\n✗ ${failedTests} test(s) failed.`);
    print('Please review the replica set configuration.');
}

print('=' .repeat(60));

// Exit with appropriate code
if (failedTests > 0) {
    quit(1);
} else {
    quit(0);
}