// Test file for Lab Extra 01 - Transactions
const { MongoClient } = require('mongodb');
const { TransactionManager, OrderSaga } = require('./transactions');

const uri = 'mongodb://localhost:27017';
const dbName = 'lab_extra_transactions';

async function runTests() {
    const manager = new TransactionManager();
    await manager.connect();

    console.log('Running Transaction Tests...\n');

    try {
        // Test 1: Successful fund transfer
        console.log('Test 1: Successful Fund Transfer');
        const transfer1 = await manager.transferFunds('ACC001', 'ACC002', 100);
        console.log('Result:', transfer1);
        console.assert(transfer1.success === true, 'Transfer should succeed');
        console.log('✓ Test 1 passed\n');

        // Test 2: Insufficient funds transfer
        console.log('Test 2: Insufficient Funds Transfer');
        const transfer2 = await manager.transferFunds('ACC002', 'ACC003', 10000);
        console.log('Result:', transfer2);
        console.assert(transfer2.success === false, 'Transfer should fail due to insufficient funds');
        console.log('✓ Test 2 passed\n');

        // Test 3: Non-existent account
        console.log('Test 3: Transfer to Non-existent Account');
        const transfer3 = await manager.transferFunds('ACC001', 'INVALID', 50);
        console.log('Result:', transfer3);
        console.assert(transfer3.success === false, 'Transfer should fail for invalid account');
        console.log('✓ Test 3 passed\n');

        // Test 4: Process order with inventory
        console.log('Test 4: Process Order with Inventory');
        const order1 = await manager.processOrder('ACC004', [
            { productId: 'PROD001', quantity: 1 },
            { productId: 'PROD002', quantity: 2 }
        ]);
        console.log('Result:', order1);
        console.assert(order1.success === true, 'Order should be processed successfully');
        console.log('✓ Test 4 passed\n');

        // Test 5: Order with insufficient inventory
        console.log('Test 5: Order with Insufficient Inventory');
        const order2 = await manager.processOrder('ACC005', [
            { productId: 'PROD001', quantity: 1000 }
        ]);
        console.log('Result:', order2);
        console.assert(order2.success === false, 'Order should fail due to insufficient inventory');
        console.log('✓ Test 5 passed\n');

        // Test 6: Distributed lock
        console.log('Test 6: Distributed Lock');
        const lock1 = await manager.acquireLock('resource1', 'owner1', 30);
        console.log('First lock:', lock1);
        console.assert(lock1.success === true, 'First lock should succeed');

        const lock2 = await manager.acquireLock('resource1', 'owner2', 30);
        console.log('Second lock attempt:', lock2);
        console.assert(lock2.success === false, 'Second lock should fail');

        const released = await manager.releaseLock('resource1', 'owner1');
        console.assert(released === true, 'Lock should be released');
        console.log('✓ Test 6 passed\n');

        // Test 7: Causal consistency
        console.log('Test 7: Causal Consistency Read');
        const history = await manager.getCausallyConsistentHistory('ACC001');
        console.log('Account:', history.account);
        console.log('Transactions:', history.transactions.length);
        console.assert(history.account !== null, 'Should retrieve account');
        console.log('✓ Test 7 passed\n');

        // Test 8: Retry logic
        console.log('Test 8: Retry Logic');
        let attemptCount = 0;
        const result = await manager.withRetry(async () => {
            attemptCount++;
            if (attemptCount < 3) {
                const error = new Error('Transient error');
                error.hasErrorLabel = () => true;
                throw error;
            }
            return { success: true };
        });
        console.log('Attempts:', attemptCount);
        console.assert(attemptCount === 3, 'Should retry 3 times');
        console.log('✓ Test 8 passed\n');

        // Test 9: Saga pattern
        console.log('Test 9: Saga Pattern');
        const saga = new OrderSaga(manager.db, manager.client);
        const sagaResult = await saga.execute({
            items: [{ productId: 'PROD003', quantity: 1 }],
            payment: { amount: 79.99, method: 'credit' },
            shipping: { address: '123 Main St', method: 'express' }
        });
        console.log('Saga result:', sagaResult);
        console.log('✓ Test 9 passed\n');

        console.log('All tests completed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await manager.disconnect();
    }
}

// Verify balances helper
async function verifyBalances() {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const accounts = db.collection('accounts');

    console.log('\nCurrent Account Balances:');
    const allAccounts = await accounts.find({}).toArray();
    allAccounts.forEach(acc => {
        console.log(`${acc._id}: ${acc.name} - $${acc.balance}`);
    });

    await client.close();
}

// Run tests
runTests().then(() => verifyBalances());