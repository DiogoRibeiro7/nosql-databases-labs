// Lab 04 - Advanced Aggregation Pipeline Examples
// This file demonstrates advanced aggregation concepts including window functions, buckets, and complex lookups

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'lab04_analytics';

async function runAdvancedAggregations() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);

        // ========================================
        // 1. COMPLEX LOOKUP WITH PIPELINE
        // ========================================
        console.log('\n1. COMPLEX LOOKUP - Sales with Full Details');
        console.log('============================================');

        const detailedSales = await db.collection('sales').aggregate([
            { $limit: 3 },
            {
                $lookup: {
                    from: 'products',
                    let: { prod_id: '$product_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$product_id', '$$prod_id'] } } },
                        {
                            $project: {
                                name: 1,
                                category: 1,
                                price: 1,
                                profit_margin: {
                                    $multiply: [
                                        { $divide: [{ $subtract: ['$price', '$cost'] }, '$price'] },
                                        100
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'product_details'
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: 'customer_id',
                    as: 'customer_details'
                }
            },
            { $unwind: '$product_details' },
            { $unwind: '$customer_details' },
            {
                $project: {
                    order_date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    customer_name: '$customer_details.name',
                    customer_segment: '$customer_details.segment',
                    product_name: '$product_details.name',
                    product_category: '$product_details.category',
                    quantity: 1,
                    amount: { $round: ['$amount', 2] },
                    profit_margin: { $round: ['$product_details.profit_margin', 2] }
                }
            }
        ]).toArray();

        console.log('Detailed Sales:');
        detailedSales.forEach(sale => {
            console.log(`  ${sale.order_date}: ${sale.customer_name} bought ${sale.quantity}x ${sale.product_name} for $${sale.amount}`);
        });

        // ========================================
        // 2. WINDOW FUNCTIONS (MongoDB 5.0+)
        // ========================================
        console.log('\n2. WINDOW FUNCTIONS - Running Totals & Rankings');
        console.log('================================================');

        const windowFunctions = await db.collection('sales').aggregate([
            {
                $match: {
                    date: { $gte: new Date('2023-10-01') }
                }
            },
            { $sort: { date: 1 } },
            {
                $setWindowFields: {
                    sortBy: { date: 1 },
                    output: {
                        running_total: {
                            $sum: '$amount',
                            window: {
                                documents: ['unbounded', 'current']
                            }
                        },
                        moving_avg_7: {
                            $avg: '$amount',
                            window: {
                                documents: [-6, 0]
                            }
                        },
                        rank: {
                            $rank: {}
                        },
                        row_number: {
                            $documentNumber: {}
                        }
                    }
                }
            },
            { $limit: 10 },
            {
                $project: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    amount: { $round: ['$amount', 2] },
                    running_total: { $round: ['$running_total', 2] },
                    moving_avg_7: { $round: ['$moving_avg_7', 2] },
                    rank: 1,
                    row_number: 1
                }
            }
        ]).toArray();

        console.log('Sales with Window Functions (First 10):');
        windowFunctions.forEach(row => {
            console.log(`  Row ${row.row_number}: ${row.date} - Amount: $${row.amount}, Running Total: $${row.running_total}`);
        });

        // ========================================
        // 3. BUCKET ANALYSIS
        // ========================================
        console.log('\n3. BUCKET ANALYSIS - Price Distribution');
        console.log('========================================');

        const priceBuckets = await db.collection('sales').aggregate([
            {
                $bucket: {
                    groupBy: '$amount',
                    boundaries: [0, 50, 100, 150, 200, 300, 500],
                    default: 'Over 500',
                    output: {
                        count: { $sum: 1 },
                        total_revenue: { $sum: '$amount' },
                        avg_amount: { $avg: '$amount' },
                        customers: { $addToSet: '$customer_id' }
                    }
                }
            },
            {
                $project: {
                    range: '$_id',
                    count: 1,
                    total_revenue: { $round: ['$total_revenue', 2] },
                    avg_amount: { $round: ['$avg_amount', 2] },
                    unique_customers: { $size: '$customers' }
                }
            }
        ]).toArray();

        console.log('Price Buckets:');
        priceBuckets.forEach(bucket => {
            const range = bucket.range === 'Over 500' ? bucket.range : `$${bucket.range[0]}-${bucket.range[1]}`;
            console.log(`  ${range}: ${bucket.count} orders, avg: $${bucket.avg_amount}, ${bucket.unique_customers} customers`);
        });

        // ========================================
        // 4. AUTO BUCKET
        // ========================================
        console.log('\n4. AUTO BUCKET - Automatic Distribution');
        console.log('========================================');

        const autoBuckets = await db.collection('products').aggregate([
            {
                $bucketAuto: {
                    groupBy: '$price',
                    buckets: 5,
                    output: {
                        count: { $sum: 1 },
                        products: { $push: '$name' },
                        avg_stock: { $avg: '$stock_quantity' }
                    }
                }
            }
        ]).toArray();

        console.log('Auto-generated Price Buckets:');
        autoBuckets.forEach(bucket => {
            console.log(`  $${bucket._id.min.toFixed(2)} - $${bucket._id.max.toFixed(2)}: ${bucket.count} products`);
        });

        // ========================================
        // 5. GRAPH LOOKUP
        // ========================================
        console.log('\n5. GRAPH LOOKUP - Customer Referral Network');
        console.log('============================================');

        // Note: This is a simulated example as our data doesn't have referrals
        // In practice, you'd use this for hierarchical or network data

        const graphExample = await db.collection('customers').aggregate([
            { $limit: 1 },
            {
                $graphLookup: {
                    from: 'customers',
                    startWith: '$customer_id',
                    connectFromField: 'customer_id',
                    connectToField: 'referred_by',
                    as: 'referral_network',
                    maxDepth: 2
                }
            },
            {
                $project: {
                    customer_id: 1,
                    name: 1,
                    network_size: { $size: '$referral_network' }
                }
            }
        ]).toArray();

        console.log('Graph Lookup Example:', graphExample[0]);

        // ========================================
        // 6. COMPLEX GROUP WITH MULTIPLE ACCUMULATORS
        // ========================================
        console.log('\n6. COMPLEX GROUPING - Category Performance');
        console.log('===========================================');

        const categoryPerformance = await db.collection('sales').aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: 'product_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    revenue: { $sum: '$amount' },
                    units_sold: { $sum: '$quantity' },
                    unique_customers: { $addToSet: '$customer_id' },
                    avg_order_value: { $avg: '$amount' },
                    min_order: { $min: '$amount' },
                    max_order: { $max: '$amount' },
                    dates: { $addToSet: { $dayOfYear: '$date' } }
                }
            },
            {
                $project: {
                    category: '$_id',
                    revenue: { $round: ['$revenue', 2] },
                    units_sold: 1,
                    customer_count: { $size: '$unique_customers' },
                    avg_order_value: { $round: ['$avg_order_value', 2] },
                    min_order: { $round: ['$min_order', 2] },
                    max_order: { $round: ['$max_order', 2] },
                    active_days: { $size: '$dates' }
                }
            },
            { $sort: { revenue: -1 } }
        ]).toArray();

        console.log('Category Performance:');
        categoryPerformance.forEach(cat => {
            console.log(`  ${cat.category}:`);
            console.log(`    Revenue: $${cat.revenue}, Units: ${cat.units_sold}`);
            console.log(`    Customers: ${cat.customer_count}, Active Days: ${cat.active_days}`);
            console.log(`    Order Range: $${cat.min_order} - $${cat.max_order}`);
        });

        // ========================================
        // 7. TIME SERIES ANALYSIS
        // ========================================
        console.log('\n7. TIME SERIES - Daily Sales Trend');
        console.log('===================================');

        const dailyTrend = await db.collection('sales').aggregate([
            {
                $match: {
                    date: { $gte: new Date('2023-11-01') }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        dayOfWeek: { $dayOfWeek: '$date' }
                    },
                    revenue: { $sum: '$amount' },
                    orders: { $count: {} }
                }
            },
            {
                $project: {
                    date: '$_id.date',
                    dayOfWeek: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$_id.dayOfWeek', 1] }, then: 'Sunday' },
                                { case: { $eq: ['$_id.dayOfWeek', 2] }, then: 'Monday' },
                                { case: { $eq: ['$_id.dayOfWeek', 3] }, then: 'Tuesday' },
                                { case: { $eq: ['$_id.dayOfWeek', 4] }, then: 'Wednesday' },
                                { case: { $eq: ['$_id.dayOfWeek', 5] }, then: 'Thursday' },
                                { case: { $eq: ['$_id.dayOfWeek', 6] }, then: 'Friday' },
                                { case: { $eq: ['$_id.dayOfWeek', 7] }, then: 'Saturday' }
                            ]
                        }
                    },
                    revenue: { $round: ['$revenue', 2] },
                    orders: 1
                }
            },
            { $sort: { date: 1 } },
            { $limit: 7 }
        ]).toArray();

        console.log('Daily Trend (Last Week):');
        dailyTrend.forEach(day => {
            console.log(`  ${day.date} (${day.dayOfWeek}): $${day.revenue} from ${day.orders} orders`);
        });

        // ========================================
        // 8. MERGE STAGE - Write Results
        // ========================================
        console.log('\n8. MERGE STAGE - Creating Summary Collection');
        console.log('=============================================');

        await db.collection('sales').aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        customer_id: '$customer_id'
                    },
                    monthly_spend: { $sum: '$amount' },
                    order_count: { $count: {} }
                }
            },
            {
                $merge: {
                    into: 'customer_monthly_summary',
                    on: '_id',
                    whenMatched: 'replace',
                    whenNotMatched: 'insert'
                }
            }
        ]).toArray();

        const summaryCount = await db.collection('customer_monthly_summary').countDocuments();
        console.log(`Created customer_monthly_summary collection with ${summaryCount} documents`);

        // ========================================
        // 9. ARRAY OPERATORS
        // ========================================
        console.log('\n9. ARRAY OPERATORS - Product Combinations');
        console.log('==========================================');

        // Create sample order with multiple items
        const multiItemOrders = await db.collection('sales').aggregate([
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: 'product_id',
                    as: 'product_info'
                }
            },
            { $unwind: '$product_info' },
            {
                $group: {
                    _id: '$customer_id',
                    products_bought: { $addToSet: '$product_info.name' },
                    total_spent: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    customer: '$_id',
                    product_count: { $size: '$products_bought' },
                    products_bought: {
                        $slice: ['$products_bought', 3]  // First 3 products
                    },
                    total_spent: { $round: ['$total_spent', 2] }
                }
            }
        ]).toArray();

        console.log('Customer Product Combinations:');
        multiItemOrders.forEach(order => {
            console.log(`  Customer ${order.customer}: ${order.product_count} different products`);
            console.log(`    Products: ${order.products_bought.join(', ')}`);
        });

        // ========================================
        // 10. EXPRESSION OPERATORS
        // ========================================
        console.log('\n10. EXPRESSION OPERATORS - Complex Calculations');
        console.log('================================================');

        const complexCalc = await db.collection('sales').aggregate([
            {
                $match: {
                    date: { $gte: new Date('2023-12-01') }
                }
            },
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: '$amount' },
                    total_quantity: { $sum: '$quantity' },
                    order_count: { $count: {} },
                    all_amounts: { $push: '$amount' }
                }
            },
            {
                $project: {
                    total_revenue: { $round: ['$total_revenue', 2] },
                    avg_revenue_per_item: {
                        $round: [
                            { $divide: ['$total_revenue', '$total_quantity'] },
                            2
                        ]
                    },
                    revenue_variance: {
                        $round: [
                            {
                                $divide: [
                                    {
                                        $reduce: {
                                            input: '$all_amounts',
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    '$$value',
                                                    {
                                                        $pow: [
                                                            {
                                                                $subtract: [
                                                                    '$$this',
                                                                    { $avg: '$all_amounts' }
                                                                ]
                                                            },
                                                            2
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    { $subtract: ['$order_count', 1] }
                                ]
                            },
                            2
                        ]
                    }
                }
            }
        ]).toArray();

        console.log('Complex Calculations (December):', complexCalc[0]);

    } catch (error) {
        console.error('Error running aggregations:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the aggregations
runAdvancedAggregations().catch(console.error);