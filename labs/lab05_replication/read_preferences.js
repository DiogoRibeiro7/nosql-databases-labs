/**
 * Lab 05 - Read Preference Examples
 *
 * This script demonstrates different MongoDB read preference modes
 * and their impact on read operations in a replica set.
 */

const { MongoClient, ReadPreference } = require('mongodb');

const REPLICA_SET_NAME = 'lab05-rs';
const REPLICA_SET_URI = `mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=${REPLICA_SET_NAME}`;

class ReadPreferenceDemo {
    constructor() {
        this.clients = {};
    }

    // Connect with different read preferences
    async connect() {
        const readPreferences = [
            { mode: 'primary', preference: ReadPreference.PRIMARY },
            { mode: 'primaryPreferred', preference: ReadPreference.PRIMARY_PREFERRED },
            { mode: 'secondary', preference: ReadPreference.SECONDARY },
            { mode: 'secondaryPreferred', preference: ReadPreference.SECONDARY_PREFERRED },
            { mode: 'nearest', preference: ReadPreference.NEAREST }
        ];

        for (const rp of readPreferences) {
            const client = new MongoClient(REPLICA_SET_URI, {
                readPreference: rp.preference,
                readConcern: { level: 'local' }
            });

            await client.connect();
            this.clients[rp.mode] = client;
            console.log(`✓ Connected with readPreference: ${rp.mode}`);
        }
    }

    // Helper to identify which server handled the read
    async identifyReadServer(client, collection) {
        try {
            // Use serverStatus to identify the server
            const admin = client.db('admin');
            const serverStatus = await admin.command({ serverStatus: 1 });

            // Get the host information
            const hostInfo = await admin.command({ hostInfo: 1 });

            return {
                host: serverStatus.host || 'unknown',
                port: serverStatus.port || 'unknown',
                isPrimary: serverStatus.repl?.ismaster || false,
                state: serverStatus.repl?.myState || 'unknown'
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    // Test read operations with different preferences
    async testReadOperations() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Read Operations with Different Preferences');
        console.log('='.repeat(60));

        const results = {};

        for (const [mode, client] of Object.entries(this.clients)) {
            console.log(`\n📖 Testing ${mode.toUpperCase()} read preference:`);

            const db = client.db('lab05_replication');
            const collection = db.collection('products');

            try {
                // Perform a read operation
                const startTime = Date.now();
                const documents = await collection.find({}).limit(10).toArray();
                const duration = Date.now() - startTime;

                // Get server information
                const serverInfo = await this.identifyReadServer(client, collection);

                results[mode] = {
                    success: true,
                    documentCount: documents.length,
                    duration: duration,
                    server: serverInfo
                };

                console.log(`  ✓ Read ${documents.length} documents in ${duration}ms`);
                console.log(`  Server: ${serverInfo.host || 'unknown'}`);
                console.log(`  Is Primary: ${serverInfo.isPrimary ? 'Yes ⭐' : 'No'}`);

            } catch (error) {
                results[mode] = {
                    success: false,
                    error: error.message
                };
                console.log(`  ✗ Read failed: ${error.message}`);
            }
        }

        return results;
    }

    // Test read preference during primary failure
    async testReadsDuringFailure() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Reads During Primary Failure');
        console.log('='.repeat(60));

        console.log('\n⚠️  This test simulates primary unavailability');
        console.log('We\'ll attempt reads with different preferences...\n');

        const testData = [];

        // Simulate primary being unavailable by using a connection string without the primary
        const secondaryOnlyUri = 'mongodb://localhost:27018,localhost:27019/?replicaSet=' + REPLICA_SET_NAME;

        for (const mode of ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest']) {
            const readPref = ReadPreference[mode.toUpperCase().replace('PREFERRED', '_PREFERRED')];

            const client = new MongoClient(secondaryOnlyUri, {
                readPreference: readPref,
                serverSelectionTimeoutMS: 5000
            });

            console.log(`\nTesting ${mode} read preference (primary unavailable):`);

            try {
                await client.connect();
                const db = client.db('lab05_replication');
                const collection = db.collection('products');

                const startTime = Date.now();
                const count = await collection.countDocuments({});
                const duration = Date.now() - startTime;

                console.log(`  ✓ Read successful: ${count} documents in ${duration}ms`);

                testData.push({
                    mode,
                    success: true,
                    duration,
                    count
                });

            } catch (error) {
                console.log(`  ✗ Read failed: ${error.message}`);

                testData.push({
                    mode,
                    success: false,
                    error: error.message
                });
            } finally {
                await client.close();
            }
        }

        return testData;
    }

    // Test read consistency with different read concerns
    async testReadConsistency() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Read Consistency');
        console.log('='.repeat(60));

        const testDoc = {
            _id: 'consistency_test_' + Date.now(),
            value: Math.random(),
            timestamp: new Date()
        };

        console.log(`\n1. Writing document to PRIMARY with w:majority...`);

        // Write to primary with majority write concern
        const primaryClient = this.clients.primary;
        const db = primaryClient.db('lab05_replication');
        const collection = db.collection('consistency_test');

        await collection.insertOne(testDoc, { w: 'majority' });
        console.log(`   ✓ Document written: ${testDoc._id}`);

        // Now read with different preferences
        console.log(`\n2. Reading immediately with different preferences:`);

        const readTests = [
            { mode: 'primary', expectedResult: 'always found' },
            { mode: 'secondary', expectedResult: 'may not be found immediately' },
            { mode: 'secondaryPreferred', expectedResult: 'depends on secondary lag' }
        ];

        for (const test of readTests) {
            const client = this.clients[test.mode];
            const readDb = client.db('lab05_replication');
            const readCollection = readDb.collection('consistency_test');

            const foundDoc = await readCollection.findOne({ _id: testDoc._id });

            console.log(`\n   ${test.mode}:`);
            console.log(`     Document found: ${foundDoc ? 'Yes ✓' : 'No ✗'}`);
            console.log(`     Expected: ${test.expectedResult}`);

            if (foundDoc) {
                const latency = new Date() - new Date(foundDoc.timestamp);
                console.log(`     Replication latency: ~${latency}ms`);
            }
        }

        // Clean up test document
        await collection.deleteOne({ _id: testDoc._id });
    }

    // Demonstrate tag-based read preferences
    async demonstrateTagSets() {
        console.log('\n' + '='.repeat(60));
        console.log('Tag-Based Read Preferences (Example)');
        console.log('='.repeat(60));

        console.log('\nTag sets allow you to direct reads to specific members:');
        console.log('\nExample configuration:');

        const exampleConfig = `
// Member tags in replica set config:
members: [
    { _id: 0, host: "localhost:27017", priority: 2, tags: { dc: "east", use: "production" } },
    { _id: 1, host: "localhost:27018", priority: 1, tags: { dc: "east", use: "analytics" } },
    { _id: 2, host: "localhost:27019", priority: 1, tags: { dc: "west", use: "analytics" } }
]

// Read preference with tag sets:
const readPref = new ReadPreference(
    ReadPreference.SECONDARY,
    [
        { dc: "east", use: "analytics" },  // Prefer east analytics
        { use: "analytics" },               // Fallback to any analytics
        {}                                   // Fallback to any secondary
    ]
);
`;

        console.log(exampleConfig);
        console.log('This would route analytics queries to dedicated analytics secondaries.');
    }

    // Performance comparison
    async comparePerformance() {
        console.log('\n' + '='.repeat(60));
        console.log('Read Performance Comparison');
        console.log('='.repeat(60));

        const iterations = 100;
        const results = {};

        for (const [mode, client] of Object.entries(this.clients)) {
            console.log(`\nBenchmarking ${mode} (${iterations} reads)...`);

            const db = client.db('lab05_replication');
            const collection = db.collection('products');

            const startTime = Date.now();
            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < iterations; i++) {
                try {
                    await collection.findOne({});
                    successCount++;
                } catch (error) {
                    errorCount++;
                }

                // Show progress
                if ((i + 1) % 20 === 0) {
                    process.stdout.write('.');
                }
            }

            const totalTime = Date.now() - startTime;
            const avgTime = totalTime / iterations;

            results[mode] = {
                totalTime,
                avgTime,
                successCount,
                errorCount,
                opsPerSecond: (iterations / totalTime) * 1000
            };

            console.log(`\n  Total time: ${totalTime}ms`);
            console.log(`  Average: ${avgTime.toFixed(2)}ms per read`);
            console.log(`  Throughput: ${results[mode].opsPerSecond.toFixed(1)} ops/sec`);
            console.log(`  Success rate: ${(successCount / iterations * 100).toFixed(1)}%`);
        }

        return results;
    }

    // Generate summary report
    generateReport(testResults) {
        console.log('\n' + '█'.repeat(60));
        console.log('READ PREFERENCE SUMMARY REPORT');
        console.log('█'.repeat(60));

        console.log('\n📊 Key Findings:\n');

        console.log('1. READ PREFERENCE MODES:');
        console.log('   - primary: Guaranteed consistency, no scale-out for reads');
        console.log('   - primaryPreferred: Consistency when possible, fallback available');
        console.log('   - secondary: Scale-out reads, eventual consistency');
        console.log('   - secondaryPreferred: Prefer scale-out, fallback to primary');
        console.log('   - nearest: Lowest latency, good for geo-distributed');

        console.log('\n2. USE CASES:');
        console.log('   - primary: Financial transactions, user authentication');
        console.log('   - secondary: Analytics, reporting, search');
        console.log('   - nearest: Content delivery, caching');

        console.log('\n3. TRADE-OFFS:');
        console.log('   Consistency vs. Availability vs. Performance');
        console.log('   - Strong consistency → Use primary');
        console.log('   - High availability → Use primaryPreferred or secondaryPreferred');
        console.log('   - Best performance → Use nearest or secondary');

        if (testResults.performance) {
            console.log('\n4. PERFORMANCE RESULTS:');
            Object.entries(testResults.performance).forEach(([mode, stats]) => {
                console.log(`   ${mode}: ${stats.opsPerSecond.toFixed(1)} ops/sec`);
            });
        }
    }

    // Cleanup
    async cleanup() {
        console.log('\nClosing connections...');
        for (const client of Object.values(this.clients)) {
            await client.close();
        }
        console.log('✓ All connections closed');
    }
}

// Main demonstration function
async function main() {
    const demo = new ReadPreferenceDemo();
    const results = {};

    try {
        // Connect with different read preferences
        await demo.connect();

        // Run tests
        results.basic = await demo.testReadOperations();
        results.consistency = await demo.testReadConsistency();
        results.performance = await demo.comparePerformance();

        // Demonstrate additional concepts
        await demo.demonstrateTagSets();

        // Optional: Test during failure (requires manual intervention)
        console.log('\n' + '='.repeat(60));
        console.log('Optional: Test During Failure');
        console.log('='.repeat(60));
        console.log('\nTo test reads during primary failure:');
        console.log('1. Run: node simulate_failover.js (in another terminal)');
        console.log('2. Then run this script with --test-failure flag');

        // Generate report
        demo.generateReport(results);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await demo.cleanup();
    }
}

// Run if called directly
if (require.main === module) {
    console.log('Lab 05 - MongoDB Read Preferences Demonstration');
    console.log('=' .repeat(60));

    // Check for test-failure flag
    if (process.argv.includes('--test-failure')) {
        const demo = new ReadPreferenceDemo();
        demo.testReadsDuringFailure()
            .then(() => console.log('\n✓ Failure test complete'))
            .catch(console.error);
    } else {
        main().catch(console.error);
    }
}

module.exports = { ReadPreferenceDemo };