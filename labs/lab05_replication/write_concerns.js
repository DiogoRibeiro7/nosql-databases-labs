/**
 * Lab 05 - Write Concern Examples
 *
 * This script demonstrates different MongoDB write concern levels
 * and their impact on write durability and performance.
 */

const { MongoClient } = require('mongodb');

const REPLICA_SET_NAME = 'lab05-rs';
const REPLICA_SET_URI = `mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=${REPLICA_SET_NAME}`;

class WriteConcernDemo {
    constructor() {
        this.client = null;
        this.db = null;
    }

    async connect() {
        this.client = new MongoClient(REPLICA_SET_URI);
        await this.client.connect();
        this.db = this.client.db('lab05_replication');
        console.log('✓ Connected to replica set');
    }

    // Test different write concern levels
    async testWriteConcerns() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Different Write Concern Levels');
        console.log('='.repeat(60));

        const collection = this.db.collection('write_concern_test');

        const writeConcerns = [
            { w: 0, j: false, label: 'Unacknowledged (w:0)' },
            { w: 1, j: false, label: 'Acknowledged by Primary (w:1)' },
            { w: 1, j: true, label: 'Acknowledged + Journaled (w:1, j:true)' },
            { w: 'majority', j: false, label: 'Majority (w:majority)' },
            { w: 'majority', j: true, wtimeoutMS: 5000, label: 'Majority + Journal + Timeout (w:majority, j:true, timeout:5s)' },
            { w: 3, j: false, label: 'All 3 members (w:3)' }
        ];

        const results = [];

        for (const wc of writeConcerns) {
            console.log(`\n📝 Testing: ${wc.label}`);

            const testDoc = {
                test_id: `wc_test_${Date.now()}_${Math.random()}`,
                write_concern: wc.label,
                timestamp: new Date(),
                data: 'x'.repeat(1000) // 1KB of data
            };

            try {
                const startTime = Date.now();

                const result = await collection.insertOne(testDoc, {
                    writeConcern: {
                        w: wc.w,
                        j: wc.j,
                        wtimeout: wc.wtimeoutMS
                    }
                });

                const duration = Date.now() - startTime;

                results.push({
                    concern: wc.label,
                    success: true,
                    duration,
                    acknowledged: result.acknowledged,
                    insertedId: result.insertedId
                });

                console.log(`  ✓ Write successful in ${duration}ms`);
                console.log(`  Acknowledged: ${result.acknowledged}`);

                if (wc.w === 0) {
                    console.log(`  ⚠️  Warning: Write may not be durable!`);
                }

            } catch (error) {
                results.push({
                    concern: wc.label,
                    success: false,
                    error: error.message
                });

                console.log(`  ✗ Write failed: ${error.message}`);
            }
        }

        return results;
    }

    // Performance comparison of write concerns
    async benchmarkWriteConcerns() {
        console.log('\n' + '='.repeat(60));
        console.log('Benchmarking Write Concern Performance');
        console.log('='.repeat(60));

        const iterations = 50;
        const collection = this.db.collection('write_benchmark');

        const concerns = [
            { w: 1, j: false, label: 'w:1' },
            { w: 1, j: true, label: 'w:1, j:true' },
            { w: 'majority', j: false, label: 'w:majority' },
            { w: 3, j: false, label: 'w:3' }
        ];

        const benchmarkResults = {};

        for (const concern of concerns) {
            console.log(`\n⚡ Benchmarking ${concern.label} (${iterations} writes)...`);

            const times = [];
            let errors = 0;

            for (let i = 0; i < iterations; i++) {
                const doc = {
                    benchmark_id: `bench_${Date.now()}_${i}`,
                    iteration: i,
                    data: 'x'.repeat(1000)
                };

                const startTime = Date.now();

                try {
                    await collection.insertOne(doc, {
                        writeConcern: {
                            w: concern.w,
                            j: concern.j
                        }
                    });

                    times.push(Date.now() - startTime);
                } catch (error) {
                    errors++;
                }

                // Progress indicator
                if ((i + 1) % 10 === 0) {
                    process.stdout.write('.');
                }
            }

            // Calculate statistics
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            const throughput = (iterations / (times.reduce((a, b) => a + b, 0) / 1000));

            benchmarkResults[concern.label] = {
                avgTime,
                minTime,
                maxTime,
                throughput,
                errors,
                successRate: ((iterations - errors) / iterations * 100)
            };

            console.log(`\n  Average: ${avgTime.toFixed(2)}ms`);
            console.log(`  Min/Max: ${minTime}ms / ${maxTime}ms`);
            console.log(`  Throughput: ${throughput.toFixed(1)} ops/sec`);
            console.log(`  Success Rate: ${benchmarkResults[concern.label].successRate.toFixed(1)}%`);
        }

        return benchmarkResults;
    }

    // Demonstrate write concern during failure
    async testWritesDuringFailure() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Write Behavior During Failures');
        console.log('='.repeat(60));

        const collection = this.db.collection('failure_test');

        console.log('\n📝 Scenario: Writing with w:3 when only 2 members are available');
        console.log('   (This simulates a member failure)\n');

        const testDoc = {
            test: 'write_with_insufficient_members',
            timestamp: new Date()
        };

        try {
            console.log('Attempting write with w:3 (requires all 3 members)...');

            await collection.insertOne(testDoc, {
                writeConcern: {
                    w: 3,
                    wtimeout: 5000 // 5 second timeout
                }
            });

            console.log('✓ Write successful (all members available)');

        } catch (error) {
            if (error.message.includes('timeout')) {
                console.log('✗ Write timed out - not enough members available');
                console.log('  This is expected if a member is down!');
            } else {
                console.log(`✗ Write failed: ${error.message}`);
            }
        }

        console.log('\n📝 Scenario: Writing with w:majority (more resilient)');

        try {
            await collection.insertOne(testDoc, {
                writeConcern: {
                    w: 'majority',
                    wtimeout: 5000
                }
            });

            console.log('✓ Write successful with majority');
            console.log('  Majority only requires 2 out of 3 members');

        } catch (error) {
            console.log(`✗ Write failed: ${error.message}`);
        }
    }

    // Demonstrate journaling impact
    async testJournaling() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Journal Impact on Durability');
        console.log('='.repeat(60));

        const collection = this.db.collection('journal_test');

        console.log('\n📝 Comparing journaled vs non-journaled writes:\n');

        const testData = [
            { config: { w: 1, j: false }, label: 'Without journal' },
            { config: { w: 1, j: true }, label: 'With journal' }
        ];

        for (const test of testData) {
            console.log(`Testing: ${test.label}`);

            const doc = {
                journal_test: test.label,
                timestamp: new Date(),
                important_data: 'This must not be lost!'
            };

            const startTime = Date.now();

            await collection.insertOne(doc, {
                writeConcern: test.config
            });

            const duration = Date.now() - startTime;

            console.log(`  Time: ${duration}ms`);

            if (test.config.j) {
                console.log(`  ✓ Data is guaranteed to be on disk (journaled)`);
                console.log(`  Recovery: Will survive unexpected shutdown`);
            } else {
                console.log(`  ⚠️  Data might only be in memory`);
                console.log(`  Recovery: May be lost if mongod crashes before journal sync`);
            }

            console.log();
        }
    }

    // Demonstrate custom write concerns
    async demonstrateCustomConcerns() {
        console.log('\n' + '='.repeat(60));
        console.log('Custom Write Concerns (Examples)');
        console.log('='.repeat(60));

        console.log('\nCustom write concerns can be defined at the replica set level:\n');

        const examples = `
// Example 1: Define custom concern for critical writes
rs.conf().settings = {
    getLastErrorDefaults: { w: "majority", j: true },
    customWriteConcerns: {
        "critical": { w: "majority", j: true, wtimeout: 10000 },
        "logging": { w: 1, j: false },
        "analytics": { w: "majority", j: false, wtimeout: 5000 }
    }
}

// Example 2: Use in application
await collection.insertOne(document, {
    writeConcern: { w: "critical" }  // Use named concern
});

// Example 3: Tag-based write concern
rs.conf().members[0].tags = { dc: "primary-dc" }
rs.conf().members[1].tags = { dc: "primary-dc" }
rs.conf().members[2].tags = { dc: "backup-dc" }

// Ensure write to primary DC
await collection.insertOne(document, {
    writeConcern: {
        w: { dc: "primary-dc" },  // Write to tagged members
        wtimeout: 5000
    }
});
`;

        console.log(examples);
    }

    // Best practices guide
    generateBestPractices(testResults) {
        console.log('\n' + '█'.repeat(60));
        console.log('WRITE CONCERN BEST PRACTICES');
        console.log('█'.repeat(60));

        console.log('\n📋 RECOMMENDATIONS BY USE CASE:\n');

        const recommendations = [
            {
                useCase: 'Financial Transactions',
                concern: 'w: "majority", j: true',
                reason: 'Maximum durability, data must not be lost'
            },
            {
                useCase: 'User Authentication',
                concern: 'w: "majority", j: true',
                reason: 'Critical data, must survive failures'
            },
            {
                useCase: 'Activity Logging',
                concern: 'w: 1, j: false',
                reason: 'High throughput, acceptable to lose recent logs'
            },
            {
                useCase: 'Analytics Data',
                concern: 'w: 1, j: false',
                reason: 'Performance priority, can be regenerated'
            },
            {
                useCase: 'Session Data',
                concern: 'w: "majority", j: false',
                reason: 'Important but can be recreated if needed'
            },
            {
                useCase: 'Real-time Metrics',
                concern: 'w: 0',
                reason: 'Fire-and-forget, old data has no value'
            }
        ];

        console.table(recommendations);

        console.log('\n⚖️  TRADE-OFF MATRIX:\n');

        const tradeoffs = [
            { concern: 'w:0', durability: '❌', performance: '⚡⚡⚡', consistency: '❌' },
            { concern: 'w:1', durability: '✓', performance: '⚡⚡', consistency: '✓' },
            { concern: 'w:1, j:true', durability: '✓✓', performance: '⚡', consistency: '✓' },
            { concern: 'w:majority', durability: '✓✓', performance: '⚡', consistency: '✓✓' },
            { concern: 'w:all', durability: '✓✓✓', performance: '🐌', consistency: '✓✓✓' }
        ];

        console.table(tradeoffs);

        if (testResults && testResults.benchmark) {
            console.log('\n📊 PERFORMANCE IMPACT (from your tests):\n');

            Object.entries(testResults.benchmark).forEach(([concern, stats]) => {
                const baseline = testResults.benchmark['w:1']?.avgTime || stats.avgTime;
                const overhead = ((stats.avgTime / baseline - 1) * 100).toFixed(1);
                console.log(`  ${concern}:`);
                console.log(`    - Avg latency: ${stats.avgTime.toFixed(2)}ms`);
                console.log(`    - Overhead vs w:1: ${overhead}%`);
                console.log(`    - Throughput: ${stats.throughput.toFixed(1)} ops/sec`);
            });
        }
    }

    async cleanup() {
        if (this.client) {
            await this.client.close();
            console.log('\n✓ Connection closed');
        }
    }
}

// Main demonstration
async function main() {
    const demo = new WriteConcernDemo();
    const results = {};

    try {
        await demo.connect();

        // Run demonstrations
        results.basic = await demo.testWriteConcerns();
        results.benchmark = await demo.benchmarkWriteConcerns();
        await demo.testJournaling();
        await demo.demonstrateCustomConcerns();

        // Optional failure test
        console.log('\n' + '='.repeat(60));
        console.log('Optional: Test During Member Failure');
        console.log('='.repeat(60));
        console.log('\nTo test write behavior during failure:');
        console.log('1. Kill one secondary: mongosh --port 27018 --eval "db.shutdownServer()"');
        console.log('2. Run: node write_concerns.js --test-failure');

        // Generate best practices
        demo.generateBestPractices(results);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await demo.cleanup();
    }
}

// Run if called directly
if (require.main === module) {
    console.log('Lab 05 - MongoDB Write Concerns Demonstration');
    console.log('=' .repeat(60));

    if (process.argv.includes('--test-failure')) {
        const demo = new WriteConcernDemo();
        demo.connect()
            .then(() => demo.testWritesDuringFailure())
            .then(() => demo.cleanup())
            .then(() => console.log('\n✓ Failure test complete'))
            .catch(console.error);
    } else {
        main().catch(console.error);
    }
}

module.exports = { WriteConcernDemo };