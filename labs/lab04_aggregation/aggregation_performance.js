// Lab 04 - Aggregation Performance and Optimization
// This file demonstrates performance considerations and optimization techniques

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'lab04_analytics';

async function testPerformance() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB for Performance Testing');
        const db = client.db(dbName);

        // ========================================
        // 1. EXPLAIN PLAN ANALYSIS
        // ========================================
        console.log('\n1. EXPLAIN PLAN ANALYSIS');
        console.log('========================');

        // Get explain plan for an aggregation
        const explainResult = await db.collection('sales').explain('executionStats').aggregate([
            { $match: { date: { $gte: new Date('2023-01-01') } } },
            { $group: { _id: '$customer_id', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);

        console.log('Execution Stats:');
        if (explainResult.stages) {
            explainResult.stages.forEach((stage, index) => {
                console.log(`  Stage ${index + 1}: ${stage.$match ? '$match' : stage.$group ? '$group' : stage.$sort ? '$sort' : '$limit'}`);
            });
        }

        // ========================================
        // 2. INDEX USAGE IN AGGREGATION
        // ========================================
        console.log('\n2. INDEX USAGE COMPARISON');
        console.log('=========================');

        // Without index (drop index first for testing)
        await db.collection('sales').dropIndex('date_1').catch(() => {});

        const startWithoutIndex = Date.now();
        const resultWithoutIndex = await db.collection('sales').aggregate([
            { $match: { date: { $gte: new Date('2023-06-01') } } },
            { $count: 'total' }
        ]).toArray();
        const timeWithoutIndex = Date.now() - startWithoutIndex;
        const withoutIndexCount = resultWithoutIndex[0]?.total || 0;

        // Create index
        await db.collection('sales').createIndex({ date: 1 });

        const startWithIndex = Date.now();
        const resultWithIndex = await db.collection('sales').aggregate([
            { $match: { date: { $gte: new Date('2023-06-01') } } },
            { $count: 'total' }
        ]).toArray();
        const timeWithIndex = Date.now() - startWithIndex;
        const withIndexCount = resultWithIndex[0]?.total || 0;

        console.log(`Without index: ${timeWithoutIndex}ms`);
        console.log(`With index: ${timeWithIndex}ms`);
        console.log(`Records matched (w/o index -> w/ index): ${withoutIndexCount} -> ${withIndexCount}`);
        console.log(`Improvement: ${((timeWithoutIndex - timeWithIndex) / timeWithoutIndex * 100).toFixed(1)}%`);

        // ========================================
        // 3. PIPELINE OPTIMIZATION PATTERNS
        // ========================================
        console.log('\n3. PIPELINE OPTIMIZATION PATTERNS');
        console.log('==================================');

        // Bad: Late filtering
        const startBadPipeline = Date.now();
        const badResult = await db.collection('sales').aggregate([
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: 'customer_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            { $match: { 'customer.segment': 'VIP' } },  // Filter after expensive operations
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();
        const timeBadPipeline = Date.now() - startBadPipeline;

        // Good: Early filtering
        const startGoodPipeline = Date.now();
        // First, get VIP customer IDs
        const vipCustomers = await db.collection('customers')
            .find({ segment: 'VIP' })
            .project({ customer_id: 1 })
            .toArray();
        const vipIds = vipCustomers.map(c => c.customer_id);

        const goodResult = await db.collection('sales').aggregate([
            { $match: { customer_id: { $in: vipIds } } },  // Filter early
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray();
        const timeGoodPipeline = Date.now() - startGoodPipeline;
        const badTotal = badResult[0]?.total || 0;
        const goodTotal = goodResult[0]?.total || 0;

        console.log('Pipeline Optimization:');
        console.log(`  Bad (late filter): ${timeBadPipeline}ms`);
        console.log(`  Good (early filter): ${timeGoodPipeline}ms`);
        console.log(`  Totals compared (bad vs good): ${badTotal} vs ${goodTotal}`);
        console.log(`  Improvement: ${((timeBadPipeline - timeGoodPipeline) / timeBadPipeline * 100).toFixed(1)}%`);

        // ========================================
        // 4. ALLOWDISKUSE FOR LARGE AGGREGATIONS
        // ========================================
        console.log('\n4. MEMORY VS DISK USAGE');
        console.log('========================');

        // Large aggregation that might exceed memory limit
        try {
            const largeAggregation = await db.collection('sales').aggregate([
                {
                    $group: {
                        _id: {
                            customer: '$customer_id',
                            product: '$product_id',
                            date: '$date'
                        },
                        total: { $sum: '$amount' },
                        details: { $push: '$$ROOT' }  // This can consume a lot of memory
                    }
                },
                { $sort: { total: -1 } }
            ], {
                allowDiskUse: true,  // Allow spilling to disk
                cursor: { batchSize: 100 }
            }).toArray();

            console.log(`Large aggregation completed with ${largeAggregation.length} results`);
        } catch (error) {
            console.log('Large aggregation would fail without allowDiskUse');
            console.log(`Details: ${error.message}`);
        }

        // ========================================
        // 5. PROJECTION OPTIMIZATION
        // ========================================
        console.log('\n5. PROJECTION OPTIMIZATION');
        console.log('==========================');

        // Without projection (fetching all fields)
        const startNoProjection = Date.now();
        const noProjectionResult = await db.collection('sales').aggregate([
            { $limit: 1000 },
            { $group: { _id: '$customer_id', total: { $sum: '$amount' } } }
        ]).toArray();
        const timeNoProjection = Date.now() - startNoProjection;

        // With projection (only needed fields)
        const startWithProjection = Date.now();
        const withProjectionResult = await db.collection('sales').aggregate([
            { $project: { customer_id: 1, amount: 1 } },  // Only keep needed fields
            { $limit: 1000 },
            { $group: { _id: '$customer_id', total: { $sum: '$amount' } } }
        ]).toArray();
        const timeWithProjection = Date.now() - startWithProjection;
        console.log(`Without projection groups: ${noProjectionResult.length}`);
        console.log(`With projection groups: ${withProjectionResult.length}`);

        console.log(`Without projection: ${timeNoProjection}ms`);
        console.log(`With projection: ${timeWithProjection}ms`);
        console.log(`Improvement: ${((timeNoProjection - timeWithProjection) / timeNoProjection * 100).toFixed(1)}%`);

        // ========================================
        // 6. LOOKUP OPTIMIZATION
        // ========================================
        console.log('\n6. LOOKUP OPTIMIZATION');
        console.log('======================');

        // Unoptimized lookup
        const startBasicLookup = Date.now();
        const basicLookup = await db.collection('sales').aggregate([
            { $limit: 100 },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: 'product_id',
                    as: 'product'
                }
            }
        ]).toArray();
        const timeBasicLookup = Date.now() - startBasicLookup;

        // Optimized lookup with pipeline
        const startOptimizedLookup = Date.now();
        const optimizedLookup = await db.collection('sales').aggregate([
            { $limit: 100 },
            {
                $lookup: {
                    from: 'products',
                    let: { prod_id: '$product_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$product_id', '$$prod_id'] } } },
                        { $project: { name: 1, category: 1 } }  // Only return needed fields
                    ],
                    as: 'product'
                }
            }
        ]).toArray();
        const timeOptimizedLookup = Date.now() - startOptimizedLookup;

        console.log(`Basic lookup: ${timeBasicLookup}ms (joined docs: ${basicLookup.length})`);
        console.log(`Optimized lookup: ${timeOptimizedLookup}ms (joined docs: ${optimizedLookup.length})`);
        console.log(`Improvement: ${((timeBasicLookup - timeOptimizedLookup) / timeBasicLookup * 100).toFixed(1)}%`);

        // ========================================
        // 7. CACHING WITH MATERIALIZED VIEWS
        // ========================================
        console.log('\n7. MATERIALIZED VIEWS FOR CACHING');
        console.log('==================================');

        // Drop existing view if exists
        await db.collection('daily_sales_cache').drop().catch(() => {});

        // Create materialized view
        await db.collection('sales').aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    revenue: { $sum: '$amount' },
                    orders: { $count: {} }
                }
            },
            { $out: 'daily_sales_cache' }  // Save results to new collection
        ]).toArray();

        // Compare query performance
        const startDirectQuery = Date.now();
        const directQuery = await db.collection('sales').aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    revenue: { $sum: '$amount' },
                    orders: { $count: {} }
                }
            }
        ]).toArray();
        const timeDirectQuery = Date.now() - startDirectQuery;

        const startCachedQuery = Date.now();
        const cachedQuery = await db.collection('daily_sales_cache').find({}).toArray();
        const timeCachedQuery = Date.now() - startCachedQuery;

        console.log(`Direct aggregation: ${timeDirectQuery}ms`);
        console.log(`Cached view query: ${timeCachedQuery}ms`);
        console.log(`Result sets (direct vs cache): ${directQuery.length} vs ${cachedQuery.length}`);
        console.log(`Improvement: ${((timeDirectQuery - timeCachedQuery) / timeDirectQuery * 100).toFixed(1)}%`);

        // ========================================
        // 8. BATCH PROCESSING
        // ========================================
        console.log('\n8. BATCH PROCESSING');
        console.log('===================');

        const batchSize = 1000;
        let processed = 0;
        const startBatch = Date.now();

        const cursor = db.collection('sales').aggregate([
            { $match: { date: { $gte: new Date('2023-01-01') } } },
            { $project: { customer_id: 1, amount: 1 } }
        ], {
            cursor: { batchSize: batchSize }
        });

        let lastCustomerId = null;

        for await (const doc of cursor) {
            processed++;
            lastCustomerId = doc.customer_id || lastCustomerId;
            // Process each document
            if (processed % batchSize === 0) {
                console.log(`  Processed ${processed} documents...`);
            }
        }

        const timeBatch = Date.now() - startBatch;
        console.log(`Total processed: ${processed} documents in ${timeBatch}ms`);
        console.log(`Rate: ${(processed / (timeBatch / 1000)).toFixed(0)} docs/second`);
        if (lastCustomerId) {
            console.log(`Last customer processed: ${lastCustomerId}`);
        }

        // ========================================
        // 9. PERFORMANCE METRICS SUMMARY
        // ========================================
        console.log('\n9. PERFORMANCE BEST PRACTICES SUMMARY');
        console.log('=====================================');

        const bestPractices = [
            '1. Use $match early in pipeline to filter documents',
            '2. Create indexes on fields used in $match stages',
            '3. Use $project to reduce document size early',
            '4. Limit $lookup operations and optimize with pipeline',
            '5. Use allowDiskUse for large aggregations',
            '6. Consider materialized views for frequently-run aggregations',
            '7. Use cursor.batchSize() for large result sets',
            '8. Monitor aggregation performance with explain()',
            '9. Avoid $where and JavaScript expressions',
            '10. Use $merge or $out to cache results'
        ];

        console.log('Best Practices:');
        bestPractices.forEach(practice => console.log(`  ${practice}`));

    } catch (error) {
        console.error('Error in performance testing:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run performance tests
testPerformance().catch(console.error);
