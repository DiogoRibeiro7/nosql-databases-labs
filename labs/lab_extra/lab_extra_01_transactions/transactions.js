// Lab Extra 01 - Transaction Implementations
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "lab_extra_transactions";

class TransactionManager {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(dbName);
    return this;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }

  // Basic fund transfer with transaction
  async transferFunds(fromAccountId, toAccountId, amount) {
    const session = this.client.startSession();
    const accounts = this.db.collection("accounts");
    const transactions = this.db.collection("transactions");

    try {
      const result = await session.withTransaction(async () => {
        // Check source account balance
        const fromAccount = await accounts.findOne({ _id: fromAccountId }, { session });

        if (!fromAccount) {
          throw new Error(`Account ${fromAccountId} not found`);
        }

        if (fromAccount.balance < amount) {
          throw new Error("Insufficient funds");
        }

        // Check destination account exists
        const toAccount = await accounts.findOne({ _id: toAccountId }, { session });

        if (!toAccount) {
          throw new Error(`Account ${toAccountId} not found`);
        }

        // Perform transfer
        await accounts.updateOne(
          { _id: fromAccountId },
          { $inc: { balance: -amount } },
          { session }
        );

        await accounts.updateOne({ _id: toAccountId }, { $inc: { balance: amount } }, { session });

        // Log transaction
        const transactionLog = await transactions.insertOne(
          {
            from: fromAccountId,
            to: toAccountId,
            amount: amount,
            type: "transfer",
            status: "completed",
            timestamp: new Date(),
          },
          { session }
        );

        return transactionLog.insertedId;
      });

      return { success: true, transactionId: result };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      await session.endSession();
    }
  }

  // Implement order with inventory reservation
  async processOrder(customerId, items) {
    const session = this.client.startSession();
    const inventory = this.db.collection("inventory");
    const orders = this.db.collection("orders");
    const accounts = this.db.collection("accounts");

    try {
      const result = await session.withTransaction(async () => {
        let totalAmount = 0;
        const reservedItems = [];

        // Reserve inventory for each item
        for (const item of items) {
          const product = await inventory.findOneAndUpdate(
            {
              _id: item.productId,
              quantity: { $gte: item.quantity },
            },
            {
              $inc: {
                quantity: -item.quantity,
                reserved: item.quantity,
              },
            },
            { session, returnDocument: "after" }
          );

          if (!product.value) {
            throw new Error(`Insufficient inventory for ${item.productId}`);
          }

          totalAmount += product.value.price * item.quantity;
          reservedItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.value.price,
          });
        }

        // Check customer balance
        const customer = await accounts.findOne({ _id: customerId }, { session });

        if (!customer || customer.balance < totalAmount) {
          throw new Error("Insufficient funds for order");
        }

        // Deduct payment
        await accounts.updateOne(
          { _id: customerId },
          { $inc: { balance: -totalAmount } },
          { session }
        );

        // Create order
        const order = await orders.insertOne(
          {
            customerId: customerId,
            items: reservedItems,
            totalAmount: totalAmount,
            status: "confirmed",
            createdAt: new Date(),
          },
          { session }
        );

        return order.insertedId;
      });

      return { success: true, orderId: result };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      await session.endSession();
    }
  }

  // Causal consistency example
  async getCausallyConsistentHistory(accountId) {
    const session = this.client.startSession({
      causalConsistency: true,
    });

    try {
      const accounts = this.db.collection("accounts");
      const transactions = this.db.collection("transactions");

      // Read account balance
      const account = await accounts.findOne({ _id: accountId }, { session });

      // Read transaction history (causally consistent with account read)
      const history = await transactions
        .find({ $or: [{ from: accountId }, { to: accountId }] }, { session })
        .sort({ timestamp: -1 })
        .toArray();

      return {
        account: account,
        transactions: history,
      };
    } finally {
      await session.endSession();
    }
  }

  // Implement distributed lock with transaction
  async acquireLock(resourceId, ownerId, ttlSeconds = 30) {
    const session = this.client.startSession();
    const locks = this.db.collection("locks");

    try {
      const result = await session.withTransaction(async () => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

        // Try to acquire lock
        const existingLock = await locks.findOne(
          {
            resourceId: resourceId,
            expiresAt: { $gt: now },
          },
          { session }
        );

        if (existingLock) {
          throw new Error("Resource is already locked");
        }

        // Clean up expired lock if exists
        await locks.deleteOne(
          {
            resourceId: resourceId,
            expiresAt: { $lte: now },
          },
          { session }
        );

        // Create new lock
        const lock = await locks.insertOne(
          {
            resourceId: resourceId,
            ownerId: ownerId,
            acquiredAt: now,
            expiresAt: expiresAt,
          },
          { session }
        );

        return lock.insertedId;
      });

      return { success: true, lockId: result };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      await session.endSession();
    }
  }

  // Release lock
  async releaseLock(resourceId, ownerId) {
    const locks = this.db.collection("locks");

    const result = await locks.deleteOne({
      resourceId: resourceId,
      ownerId: ownerId,
    });

    return result.deletedCount > 0;
  }

  // Retry logic for transient errors
  async withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const isRetryable =
          error.hasErrorLabel?.("TransientTransactionError") ||
          error.hasErrorLabel?.("UnknownTransactionCommitResult");

        if (isRetryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100; // Exponential backoff
          console.log(`Retrying transaction (attempt ${attempt + 1}) after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }
}

// Example Saga Pattern Implementation
class OrderSaga {
  constructor(db, client) {
    this.db = db;
    this.client = client;
    this.compensations = [];
  }

  async execute(orderData) {
    try {
      // Step 1: Reserve inventory
      const reservation = await this.reserveInventory(orderData.items);
      this.compensations.push(() => this.releaseInventory(reservation));

      // Step 2: Process payment
      const payment = await this.processPayment(orderData.payment);
      this.compensations.push(() => this.refundPayment(payment));

      // Step 3: Create shipment
      const shipment = await this.createShipment(orderData.shipping);
      this.compensations.push(() => this.cancelShipment(shipment));

      // Step 4: Finalize order
      const order = await this.finalizeOrder({
        ...orderData,
        reservation,
        payment,
        shipment,
      });

      return { success: true, order };
    } catch (error) {
      // Compensate in reverse order
      console.log("Saga failed, compensating...");
      for (const compensate of this.compensations.reverse()) {
        try {
          await compensate();
        } catch (compError) {
          console.error("Compensation failed:", compError);
        }
      }
      return { success: false, error: error.message };
    }
  }

  async reserveInventory(items) {
    // Implementation
    console.log("Reserving inventory:", items);
    return { reservationId: "RES" + Date.now(), items };
  }

  async releaseInventory(reservation) {
    console.log("Releasing inventory:", reservation);
  }

  async processPayment(paymentInfo) {
    console.log("Processing payment:", paymentInfo);
    return { paymentId: "PAY" + Date.now(), ...paymentInfo };
  }

  async refundPayment(payment) {
    console.log("Refunding payment:", payment);
  }

  async createShipment(shippingInfo) {
    console.log("Creating shipment:", shippingInfo);
    return { shipmentId: "SHIP" + Date.now(), ...shippingInfo };
  }

  async cancelShipment(shipment) {
    console.log("Cancelling shipment:", shipment);
  }

  async finalizeOrder(orderData) {
    const orders = this.db.collection("orders");
    const result = await orders.insertOne({
      ...orderData,
      status: "completed",
      createdAt: new Date(),
    });
    return { orderId: result.insertedId, ...orderData };
  }
}

module.exports = { TransactionManager, OrderSaga };
