/**
 * Lab 02 - Test Data Model Queries (mongosh version)
 *
 * Run this in mongosh to test the data model:
 * mongosh lab02_ecommerce --file test_queries_mongosh.js
 */

use('lab02_ecommerce');

print("=" .repeat(60));
print("Lab 02 - Testing E-Commerce Data Model");
print("=" .repeat(60));

let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function to assert conditions
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Helper function to run tests
function runTest(testName, testFunc) {
    print(`\nTesting: ${testName}...`);
    try {
        testFunc();
        passedTests++;
        testResults.push({ test: testName, status: '✓ PASSED' });
        print(`  ✓ PASSED`);
        return true;
    } catch (error) {
        failedTests++;
        testResults.push({ test: testName, status: '✗ FAILED', error: error.toString() });
        print(`  ✗ FAILED: ${error}`);
        return false;
    }
}

// ========================================================================
// Test 1: Verify Collections Exist
// ========================================================================
runTest('Collections exist', () => {
    const collections = db.getCollectionNames();

    assert(collections.includes('customers'), 'customers collection missing');
    assert(collections.includes('products'), 'products collection missing');
    assert(collections.includes('orders'), 'orders collection missing');
    assert(collections.includes('reviews'), 'reviews collection missing');

    print(`    Found ${collections.length} collections`);
});

// ========================================================================
// Test 2: Verify Data Exists
// ========================================================================
runTest('Data exists in collections', () => {
    const customerCount = db.customers.countDocuments();
    const productCount = db.products.countDocuments();
    const orderCount = db.orders.countDocuments();
    const reviewCount = db.reviews.countDocuments();

    assert(customerCount > 0, 'No customers found');
    assert(productCount > 0, 'No products found');
    assert(orderCount > 0, 'No orders found');
    assert(reviewCount > 0, 'No reviews found');

    print(`    Found: ${customerCount} customers, ${productCount} products, ${orderCount} orders, ${reviewCount} reviews`);
});

// ========================================================================
// Test 3: Test Customer Orders Query (Requirement 1)
// ========================================================================
runTest('Query 1: Get customer recent orders', () => {
    const orders = db.orders
        .find({ customer_id: 'CUST001' })
        .sort({ order_date: -1 })
        .toArray();

    assert(orders.length > 0, 'No orders found for customer CUST001');
    assert(orders[0].customer_id === 'CUST001', 'Wrong customer ID in results');

    // Verify orders are sorted by date (descending)
    for (let i = 1; i < orders.length; i++) {
        const prevDate = orders[i - 1].order_date;
        const currDate = orders[i].order_date;
        assert(prevDate >= currDate, 'Orders not sorted by date correctly');
    }

    print(`    Found ${orders.length} orders for CUST001, properly sorted`);
});

// ========================================================================
// Test 4: Test Order Items Query (Requirement 2)
// ========================================================================
runTest('Query 2: Get order with all items', () => {
    const order = db.orders.findOne({ order_id: 'ORD001' });

    assert(order !== null, 'Order ORD001 not found');
    assert(Array.isArray(order.items), 'Order items should be an array');
    assert(order.items.length > 0, 'Order should have items');

    // Verify embedded items have required fields
    order.items.forEach(item => {
        assert(item.product_id, 'Item missing product_id');
        assert(item.product_name, 'Item missing product_name');
        assert(item.quantity > 0, 'Item quantity should be positive');
        assert(item.unit_price > 0, 'Item unit_price should be positive');
    });

    // Verify no additional query needed (items are embedded)
    assert(order.items[0].product_name, 'Product names should be denormalized in order items');

    print(`    Order has ${order.items.length} embedded items with denormalized data`);
});

// ========================================================================
// Test 5: Test Top Products Query (Requirement 3)
// ========================================================================
runTest('Query 3: Get top products by sales', () => {
    const topProducts = db.orders.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product_id',
                product_name: { $first: '$items.product_name' },
                total_quantity_sold: { $sum: '$items.quantity' }
            }
        },
        { $sort: { total_quantity_sold: -1 } },
        { $limit: 5 }
    ]).toArray();

    assert(topProducts.length > 0, 'No top products found');
    assert(topProducts[0].total_quantity_sold > 0, 'Top product should have sales');

    // Verify sorting
    for (let i = 1; i < topProducts.length; i++) {
        assert(
            topProducts[i - 1].total_quantity_sold >= topProducts[i].total_quantity_sold,
            'Products not sorted by quantity correctly'
        );
    }

    print(`    Found ${topProducts.length} top products, properly sorted`);
});

// ========================================================================
// Test 6: Test Category Filter Query (Requirement 4)
// ========================================================================
runTest('Query 4: Filter products by category', () => {
    const products = db.products
        .find({ category: 'Electronics' })
        .toArray();

    assert(products.length > 0, 'No products found in Electronics category');
    products.forEach(product => {
        assert(product.category === 'Electronics', 'Wrong category in results');
    });

    // Test with price range
    const filteredProducts = db.products.find({
        category: 'Electronics',
        price: { $gte: 50, $lte: 1000 }
    }).toArray();

    filteredProducts.forEach(product => {
        assert(product.price >= 50 && product.price <= 1000, 'Price out of range');
    });

    print(`    Found ${products.length} Electronics products with valid filtering`);
});

// ========================================================================
// Test 7: Verify Indexes Exist
// ========================================================================
runTest('Required indexes exist', () => {
    // Check customers indexes
    const customerIndexes = db.customers.getIndexes();
    const customerIndexNames = customerIndexes.map(idx => Object.keys(idx.key).join(','));
    assert(customerIndexNames.includes('customer_id'), 'Missing customer_id index');
    assert(customerIndexNames.includes('email'), 'Missing email index');

    // Check products indexes
    const productIndexes = db.products.getIndexes();
    const productIndexNames = productIndexes.map(idx => Object.keys(idx.key).join(','));
    assert(productIndexNames.includes('category'), 'Missing category index');
    assert(productIndexNames.includes('product_id'), 'Missing product_id index');

    // Check orders indexes
    const orderIndexes = db.orders.getIndexes();
    const orderIndexNames = orderIndexes.map(idx => Object.keys(idx.key).join(','));
    assert(orderIndexNames.includes('customer_id'), 'Missing customer_id index on orders');
    assert(orderIndexNames.includes('order_id'), 'Missing order_id index');

    print(`    Found ${customerIndexes.length} indexes on customers`);
    print(`    Found ${productIndexes.length} indexes on products`);
    print(`    Found ${orderIndexes.length} indexes on orders`);
});

// ========================================================================
// Test 8: Test Data Integrity
// ========================================================================
runTest('Data integrity checks', () => {
    // Check unique constraints
    const customers = db.customers.find().toArray();
    const emails = customers.map(c => c.email);
    const uniqueEmails = [...new Set(emails)];
    assert(emails.length === uniqueEmails.length, 'Duplicate emails found');

    // Check referential integrity
    const orders = db.orders.find().toArray();
    const customerIds = customers.map(c => c.customer_id);

    orders.forEach(order => {
        assert(customerIds.includes(order.customer_id),
            `Order ${order.order_id} references non-existent customer ${order.customer_id}`);
    });

    // Check denormalized data consistency
    orders.forEach(order => {
        order.items.forEach(item => {
            // Denormalized product names should exist (historical data)
            assert(item.product_name, `Missing product name in order ${order.order_id}`);
        });
    });

    print(`    Data integrity verified: unique emails, valid references, denormalized data`);
});

// ========================================================================
// Test 9: Test Query Performance
// ========================================================================
runTest('Query performance with indexes', () => {
    // Test indexed query performance
    const explainResult = db.orders.explain('executionStats')
        .find({ customer_id: 'CUST001' });

    if (explainResult.executionStats) {
        const stats = explainResult.executionStats;

        // Should use index, not collection scan
        if (stats.executionStages) {
            const stage = stats.executionStages.stage;
            assert(
                stage !== 'COLLSCAN',
                'Query should use index, not collection scan'
            );
        }

        // Should be efficient
        assert(
            stats.totalDocsExamined <= stats.nReturned * 2,
            'Query examining too many documents (inefficient)'
        );

        print(`    Execution time: ${stats.executionTimeMillis}ms`);
        print(`    Docs examined: ${stats.totalDocsExamined}`);
        print(`    Docs returned: ${stats.nReturned}`);
    }
});

// ========================================================================
// Test 10: Test Embedded vs Referenced Design
// ========================================================================
runTest('Embedded vs Referenced design validation', () => {
    // Verify order items are embedded (not referenced)
    const order = db.orders.findOne();
    assert(Array.isArray(order.items), 'Order items should be embedded array');
    assert(order.items[0].product_name, 'Product info should be denormalized in items');

    // Verify reviews are NOT embedded in products (separate collection)
    const product = db.products.findOne();
    assert(!product.reviews || !Array.isArray(product.reviews),
        'Reviews should NOT be embedded in products (unbounded growth)');

    // Verify customer address is embedded
    const customer = db.customers.findOne();
    assert(customer.address && typeof customer.address === 'object',
        'Customer address should be embedded');

    print(`    Design validated: proper embedding and referencing`);
});

// ========================================================================
// Test 11: Test Aggregation Pipeline
// ========================================================================
runTest('Complex aggregation pipeline', () => {
    // Customer spending analysis
    const customerSpending = db.orders.aggregate([
        { $match: { customer_id: 'CUST001' } },
        {
            $group: {
                _id: '$customer_id',
                total_spent: { $sum: '$total' },
                order_count: { $sum: 1 },
                avg_order_value: { $avg: '$total' }
            }
        }
    ]).toArray();

    assert(customerSpending.length > 0, 'Aggregation should return results');
    assert(customerSpending[0].total_spent > 0, 'Customer should have spending');
    assert(customerSpending[0].order_count > 0, 'Customer should have orders');

    print(`    Aggregation successful: ${customerSpending[0].order_count} orders, $${customerSpending[0].total_spent.toFixed(2)} total`);
});

// ========================================================================
// Test 12: Test Write Operations
// ========================================================================
runTest('Write operations', () => {
    // Test insert
    const testProduct = {
        product_id: 'TEST_PROD_' + new Date().getTime(),
        name: 'Test Product',
        category: 'Test',
        price: 99.99,
        stock_quantity: 10
    };

    const insertResult = db.products.insertOne(testProduct);
    assert(insertResult.acknowledged, 'Insert should be acknowledged');

    // Test update
    const updateResult = db.products.updateOne(
        { _id: insertResult.insertedId },
        { $inc: { stock_quantity: -1 } }
    );
    assert(updateResult.modifiedCount === 1, 'Should modify one document');

    // Verify update
    const updated = db.products.findOne({ _id: insertResult.insertedId });
    assert(updated.stock_quantity === 9, 'Stock should be decremented');

    // Test delete
    const deleteResult = db.products.deleteOne({ _id: insertResult.insertedId });
    assert(deleteResult.deletedCount === 1, 'Should delete one document');

    print(`    Write operations successful: insert, update, delete`);
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
    print('\n✓ All tests passed successfully!');
    print('The data model correctly supports all required operations.');
} else {
    print(`\n✗ ${failedTests} test(s) failed.`);
    print('Please review the data model and fix the issues.');
}

print('=' .repeat(60));

// Exit with appropriate code
if (failedTests > 0) {
    quit(1);
} else {
    quit(0);
}