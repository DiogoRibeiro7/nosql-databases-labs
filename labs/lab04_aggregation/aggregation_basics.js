// Lab 04 - Basic Aggregation Pipeline Examples
// This file demonstrates fundamental aggregation concepts

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'lab04_analytics';

async function runBasicAggregations() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);

        // ========================================
        // 1. BASIC AGGREGATION - $match and $group
        // ========================================
        console.log('\n1. BASIC AGGREGATION - Total Revenue');
        console.log('=====================================');

        const totalRevenue = await db.collection('sales').aggregate([
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: '$amount' },
                    total_orders: { $count: {} },
                    avg_order_value: { $avg: '$amount' }
                }
            }
        ]).toArray();

        console.log('Total Revenue:', totalRevenue[0]);

        // ========================================
        // 2. FILTERING WITH $match
        // ========================================
        console.log('\n2. FILTERING - Sales in Q4 2023');
        console.log('================================');

        const q4Sales = await db.collection('sales').aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date('2023-10-01'),
                        $lt: new Date('2024-01-01')
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$amount' },
                    orders: { $count: {} }
                }
            }
        ]).toArray();

        console.log('Q4 2023 Sales:', q4Sales[0]);

        // ========================================
        // 3. GROUPING BY FIELD
        // ========================================
        console.log('\n3. GROUP BY - Revenue by Customer Segment');
        console.log('==========================================');

        const revenueBySegment = await db.collection('sales').aggregate([
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: 'customer_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $group: {
                    _id: '$customer.segment',
                    revenue: { $sum: '$amount' },
                    orders: { $count: {} },
                    avg_order: { $avg: '$amount' }
                }
            },
            { $sort: { revenue: -1 } }
        ]).toArray();

        console.log('Revenue by Segment:');
        revenueBySegment.forEach(segment => {
            console.log(`  ${segment._id}: $${segment.revenue.toFixed(2)} (${segment.orders} orders)`);
        });

        // ========================================
        // 4. DATE OPERATIONS
        // ========================================
        console.log('\n4. DATE OPERATIONS - Monthly Revenue');
        console.log('=====================================');

        const monthlyRevenue = await db.collection('sales').aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    revenue: { $sum: '$amount' },
                    orders: { $count: {} }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            },
            { $limit: 6 }  // Last 6 months
        ]).toArray();

        console.log('Monthly Revenue (Last 6 months):');
        monthlyRevenue.forEach(month => {
            console.log(`  ${month._id.year}-${String(month._id.month).padStart(2, '0')}: $${month.revenue.toFixed(2)}`);
        });

        // ========================================
        // 5. PROJECTION WITH $project
        // ========================================
        console.log('\n5. PROJECTION - Formatted Sales Data');
        console.log('=====================================');

        const formattedSales = await db.collection('sales').aggregate([
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    order_id: '$_id',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    customer: '$customer_id',
                    amount: { $round: ['$amount', 2] },
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    dayOfWeek: { $dayOfWeek: '$date' }
                }
            }
        ]).toArray();

        console.log('Formatted Sales (First 5):');
        formattedSales.forEach(sale => {
            console.log(`  Order ${sale.customer} on ${sale.date}: $${sale.amount}`);
        });

        // ========================================
        // 6. SORTING AND LIMITING
        // ========================================
        console.log('\n6. TOP CUSTOMERS - By Revenue');
        console.log('==============================');

        const topCustomers = await db.collection('sales').aggregate([
            {
                $group: {
                    _id: '$customer_id',
                    total_spent: { $sum: '$amount' },
                    order_count: { $count: {} },
                    avg_order: { $avg: '$amount' }
                }
            },
            { $sort: { total_spent: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: 'customer_id',
                    as: 'details'
                }
            },
            { $unwind: '$details' },
            {
                $project: {
                    customer_id: '$_id',
                    name: '$details.name',
                    segment: '$details.segment',
                    total_spent: { $round: ['$total_spent', 2] },
                    order_count: 1,
                    avg_order: { $round: ['$avg_order', 2] }
                }
            }
        ]).toArray();

        console.log('Top 5 Customers:');
        topCustomers.forEach((customer, index) => {
            console.log(`  ${index + 1}. ${customer.name} (${customer.segment}): $${customer.total_spent} - ${customer.order_count} orders`);
        });

        // ========================================
        // 7. ARRAY OPERATIONS WITH $unwind
        // ========================================
        console.log('\n7. ARRAY OPERATIONS - Product Categories');
        console.log('=========================================');

        // First, let's add some sample data with arrays
        const productCategories = await db.collection('products').aggregate([
            {
                $group: {
                    _id: '$category',
                    products: { $push: '$name' },
                    avg_price: { $avg: '$price' },
                    count: { $count: {} }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();

        console.log('Products by Category:');
        productCategories.forEach(cat => {
            console.log(`  ${cat._id}: ${cat.count} products, avg price: $${cat.avg_price.toFixed(2)}`);
        });

        // ========================================
        // 8. CONDITIONAL OPERATIONS WITH $cond
        // ========================================
        console.log('\n8. CONDITIONAL - Order Size Classification');
        console.log('===========================================');

        const orderSizes = await db.collection('sales').aggregate([
            {
                $project: {
                    customer_id: 1,
                    amount: 1,
                    order_size: {
                        $cond: {
                            if: { $gte: ['$amount', 200] },
                            then: 'Large',
                            else: {
                                $cond: {
                                    if: { $gte: ['$amount', 100] },
                                    then: 'Medium',
                                    else: 'Small'
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$order_size',
                    count: { $count: {} },
                    total_revenue: { $sum: '$amount' },
                    avg_amount: { $avg: '$amount' }
                }
            },
            { $sort: { avg_amount: -1 } }
        ]).toArray();

        console.log('Order Size Distribution:');
        orderSizes.forEach(size => {
            console.log(`  ${size._id}: ${size.count} orders, avg: $${size.avg_amount.toFixed(2)}`);
        });

        // ========================================
        // 9. ACCUMULATOR OPERATORS
        // ========================================
        console.log('\n9. ACCUMULATORS - Statistical Analysis');
        console.log('=======================================');

        const stats = await db.collection('sales').aggregate([
            {
                $group: {
                    _id: null,
                    min_order: { $min: '$amount' },
                    max_order: { $max: '$amount' },
                    avg_order: { $avg: '$amount' },
                    std_deviation: { $stdDevPop: '$amount' },
                    total_quantity: { $sum: '$quantity' },
                    unique_customers: { $addToSet: '$customer_id' }
                }
            },
            {
                $project: {
                    _id: 0,
                    min_order: { $round: ['$min_order', 2] },
                    max_order: { $round: ['$max_order', 2] },
                    avg_order: { $round: ['$avg_order', 2] },
                    std_deviation: { $round: ['$std_deviation', 2] },
                    total_quantity: 1,
                    unique_customer_count: { $size: '$unique_customers' }
                }
            }
        ]).toArray();

        console.log('Sales Statistics:', stats[0]);

        // ========================================
        // 10. FACETED SEARCH WITH $facet
        // ========================================
        console.log('\n10. FACETED SEARCH - Multiple Aggregations');
        console.log('===========================================');

        const facetedResults = await db.collection('sales').aggregate([
            {
                $facet: {
                    'revenue_by_month': [
                        {
                            $group: {
                                _id: { $month: '$date' },
                                revenue: { $sum: '$amount' }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    'top_products': [
                        {
                            $group: {
                                _id: '$product_id',
                                revenue: { $sum: '$amount' }
                            }
                        },
                        { $sort: { revenue: -1 } },
                        { $limit: 3 }
                    ],
                    'order_stats': [
                        {
                            $group: {
                                _id: null,
                                total_orders: { $count: {} },
                                total_revenue: { $sum: '$amount' },
                                avg_order: { $avg: '$amount' }
                            }
                        }
                    ]
                }
            }
        ]).toArray();

        console.log('Faceted Results:');
        console.log('  Top 3 Products:', facetedResults[0].top_products.map(p => p._id).join(', '));
        console.log('  Order Stats:', facetedResults[0].order_stats[0]);

    } catch (error) {
        console.error('Error running aggregations:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the aggregations
runBasicAggregations().catch(console.error);