---
- Completion of Labs 1-5
- MongoDB 4.0+ (for transaction support)
- Replica set deployment (can use local replica set)
---

# Lab Extra 01 – Consistency Patterns & Transactions

## Objectives

By the end of this lab you should be able to:

- Understand ACID properties in MongoDB transactions
- Implement multi-document transactions
- Configure and use read/write concerns
- Handle consistency patterns in distributed systems
- Implement retry logic for transient errors
- Work with causal consistency sessions

## 1\. Setup

### 1.1 Initialize Replica Set for Transactions

Transactions require a replica set. For local development:

```bash
# Note: mongod is the server process that needs to be running
# Start MongoDB as a replica set (if not already running)
# On Windows: MongoDB service should be configured as replica set
# On Mac/Linux: mongod --replSet rs0 --port 27017 --dbpath /data/db

# Connect with mongosh to initialize replica set
mongosh

# In the mongosh shell, initialize replica set
rs.initiate()
```

### 1.2 Setup Database

Run the setup script to initialize the database:

```bash
# Unix/Linux/Mac
./setup_database.sh

# Windows
setup_database.bat
```

--------------------------------------------------------------------------------

## 2\. Understanding Transactions

### 2.1 ACID Properties in MongoDB

MongoDB supports ACID transactions:

- **Atomicity**: All operations succeed or all fail
- **Consistency**: Data remains valid after transaction
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist

### 2.2 Transaction Use Cases

Transactions are essential for:

- Financial operations (transfers, payments)
- Inventory management
- Order processing
- Any operation requiring multiple document updates

--------------------------------------------------------------------------------

## 3\. Basic Transactions

### 3.1 Simple Transaction Example

```javascript
// Transfer money between accounts
async function transferFunds(fromAccountId, toAccountId, amount) {
    const session = client.startSession();

    try {
        await session.withTransaction(async () => {
            // Debit from account
            await accounts.updateOne(
                { _id: fromAccountId },
                { $inc: { balance: -amount } },
                { session }
            );

            // Credit to account
            await accounts.updateOne(
                { _id: toAccountId },
                { $inc: { balance: amount } },
                { session }
            );

            // Log transaction
            await transactions.insertOne({
                from: fromAccountId,
                to: toAccountId,
                amount: amount,
                timestamp: new Date()
            }, { session });
        });

        console.log("Transaction completed successfully");
    } catch (error) {
        console.error("Transaction failed:", error);
    } finally {
        await session.endSession();
    }
}
```

--------------------------------------------------------------------------------

## 4\. Read/Write Concerns

### 4.1 Write Concerns

Control durability guarantees:

```javascript
// Majority write concern
await collection.insertOne(
    { name: "Important Document" },
    { writeConcern: { w: "majority", j: true } }
);

// Custom write concern
await collection.updateOne(
    { _id: docId },
    { $set: { status: "critical" } },
    { writeConcern: { w: 2, wtimeout: 5000 } }
);
```

### 4.2 Read Concerns

Control consistency of read operations:

```javascript
// Read with snapshot isolation
await collection.find({})
    .readConcern("snapshot")
    .toArray();

// Read with linearizable consistency
await collection.findOne(
    { _id: docId },
    { readConcern: { level: "linearizable" } }
);
```

--------------------------------------------------------------------------------

## 5\. Consistency Patterns

### 5.1 Causal Consistency

Maintain read-your-writes consistency:

```javascript
const session = client.startSession({
    causalConsistency: true
});

// Write operation
await collection.insertOne(
    { data: "value" },
    { session }
);

// Subsequent read sees the write
const result = await collection.findOne(
    { data: "value" },
    { session }
);
```

### 5.2 Eventual Consistency

Handle eventual consistency in distributed systems:

```javascript
// Read from secondary with eventual consistency
await collection.find({})
    .readPreference("secondary")
    .readConcern("local")
    .toArray();
```

--------------------------------------------------------------------------------

## 6\. Advanced Transaction Patterns

### 6.1 Saga Pattern

Implement long-running transactions with compensating actions:

```javascript
class OrderSaga {
    async execute(orderData) {
        const steps = [];

        try {
            // Step 1: Reserve inventory
            const inventoryReservation = await this.reserveInventory(orderData.items);
            steps.push({ action: 'reserveInventory', data: inventoryReservation });

            // Step 2: Process payment
            const payment = await this.processPayment(orderData.payment);
            steps.push({ action: 'processPayment', data: payment });

            // Step 3: Create order
            const order = await this.createOrder(orderData);
            steps.push({ action: 'createOrder', data: order });

            return order;
        } catch (error) {
            // Compensate in reverse order
            await this.compensate(steps.reverse());
            throw error;
        }
    }

    async compensate(steps) {
        for (const step of steps) {
            switch(step.action) {
                case 'reserveInventory':
                    await this.releaseInventory(step.data);
                    break;
                case 'processPayment':
                    await this.refundPayment(step.data);
                    break;
                case 'createOrder':
                    await this.cancelOrder(step.data);
                    break;
            }
        }
    }
}
```

### 6.2 Two-Phase Commit

Implement distributed transactions:

```javascript
class TwoPhaseCommit {
    async execute(transaction) {
        const participants = [];

        // Phase 1: Prepare
        for (const operation of transaction.operations) {
            const prepared = await this.prepare(operation);
            participants.push(prepared);
        }

        // Check if all prepared successfully
        if (participants.every(p => p.status === 'prepared')) {
            // Phase 2: Commit
            for (const participant of participants) {
                await this.commit(participant);
            }
        } else {
            // Rollback
            for (const participant of participants) {
                await this.rollback(participant);
            }
        }
    }
}
```

--------------------------------------------------------------------------------

## 7\. Error Handling & Retry Logic

### 7.1 Implementing Retry Logic

```javascript
async function withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (error.hasErrorLabel("TransientTransactionError") && attempt < maxRetries) {
                console.log(`Retrying transaction (attempt ${attempt + 1})`);
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
            } else {
                throw error;
            }
        }
    }
}
```

--------------------------------------------------------------------------------

## 8\. Exercises

### Exercise 1: Bank Transfer System

Implement a banking system with transactions:

```javascript
// TODO: Implement these functions
async function createAccount(name, initialBalance) {
    // Create account with initial balance
}

async function transfer(fromAccount, toAccount, amount) {
    // Transfer with transaction
    // Check sufficient balance
    // Handle concurrent transfers
}

async function getAccountHistory(accountId) {
    // Get transaction history with causal consistency
}
```

### Exercise 2: E-commerce Order Processing

Create an order processing system with consistency guarantees:

```javascript
// TODO: Implement order processing with:
// - Inventory reservation
// - Payment processing
// - Order creation
// - Rollback on failure
```

### Exercise 3: Distributed Lock Implementation

Implement a distributed lock using transactions:

```javascript
// TODO: Create distributed lock with:
// - Acquire lock with timeout
// - Release lock
// - Handle expired locks
// - Prevent deadlocks
```

--------------------------------------------------------------------------------

## 9\. Testing Your Implementation

Run the test suite:

```bash
npm test
```

Individual test files:

- `test_transactions.js` - Basic transaction tests
- `test_consistency.js` - Consistency pattern tests
- `test_saga.js` - Saga pattern tests

--------------------------------------------------------------------------------

## 10\. Best Practices

1. **Keep transactions short** - Minimize lock time
2. **Handle retries** - Implement exponential backoff
3. **Use appropriate concerns** - Balance consistency vs performance
4. **Monitor performance** - Track transaction metrics
5. **Test failure scenarios** - Ensure proper rollback

--------------------------------------------------------------------------------

## Additional Resources

- [MongoDB Transactions Documentation](https://docs.mongodb.com/manual/core/transactions/)
- [Read/Write Concerns](https://docs.mongodb.com/manual/reference/read-concern/)
- [Causal Consistency](https://docs.mongodb.com/manual/core/causal-consistency-read-write-concerns/)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)

---

## Feedback & Collaboration

- Report transaction-lab issues or feature requests in [GitHub Issues](https://github.com/diogoribeiro7/nosql-databases-labs/issues) using the `lab_extra_01` label.
- Start or join conversations in [Discussions](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) to compare approaches for retry logic, consistency patterns, or saga workflows.
