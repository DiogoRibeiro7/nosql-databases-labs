// Lab Extra 02 - Sharding Demo and Implementation
const { MongoClient } = require("mongodb");

class ShardingManager {
  constructor (mongosUri = "mongodb://localhost:27017") {
    this.mongosUri = mongosUri;
    this.client = null;
    this.adminDb = null;
  }

  async connect () {
    this.client = new MongoClient(this.mongosUri);
    await this.client.connect();
    this.adminDb = this.client.db("admin");
    console.log("Connected to mongos router");
    return this;
  }

  async disconnect () {
    if (this.client) {
      await this.client.close();
    }
  }

  // Get sharding status
  async getStatus () {
    try {
      const result = await this.adminDb.command({ listShards: 1 });
      return result.shards;
    } catch (error) {
      console.error("Error getting shard status:", error);
      return [];
    }
  }

  // Enable sharding on database
  async enableSharding (dbName) {
    try {
      const result = await this.adminDb.command({
        enableSharding: dbName,
      });
      console.log(`Sharding enabled on ${dbName}:`, result);
      return result;
    } catch (error) {
      if (error.message.includes("already enabled")) {
        console.log(`Sharding already enabled on ${dbName}`);
        return { ok: 1 };
      }
      throw error;
    }
  }

  // Shard a collection
  async shardCollection (namespace, shardKey, options = {}) {
    try {
      const command = {
        shardCollection: namespace,
        key: shardKey,
        ...options,
      };

      const result = await this.adminDb.command(command);
      console.log(`Collection ${namespace} sharded with key ${JSON.stringify(shardKey)}`);
      return result;
    } catch (error) {
      if (error.message.includes("already sharded")) {
        console.log(`Collection ${namespace} is already sharded`);
        return { ok: 1 };
      }
      throw error;
    }
  }

  // Get shard distribution for a collection
  async getShardDistribution (dbName, collectionName) {
    const db = this.client.db(dbName);
    const collection = db.collection(collectionName);

    try {
      // Get collection stats
      const stats = await collection.stats();

      if (!stats.sharded) {
        return { sharded: false, message: "Collection is not sharded" };
      }

      // Get chunk distribution
      const configDb = this.client.db("config");
      const chunks = await configDb
        .collection("chunks")
        .aggregate([
          { $match: { ns: `${dbName}.${collectionName}` } },
          { $group: { _id: "$shard", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      return {
        sharded: true,
        shards: stats.shards,
        chunks: chunks,
        avgObjSize: stats.avgObjSize,
        totalSize: stats.size,
        count: stats.count,
      };
    } catch (error) {
      console.error("Error getting distribution:", error);
      return { error: error.message };
    }
  }

  // Pre-split chunks for better initial distribution
  async preSplitChunks (namespace, splitPoints) {
    const results = [];

    for (const point of splitPoints) {
      try {
        await this.adminDb.command({
          split: namespace,
          middle: point,
        });
        results.push({ point, success: true });
      } catch (error) {
        results.push({ point, success: false, error: error.message });
      }
    }

    return results;
  }

  // Move chunk to different shard
  async moveChunk (namespace, findKey, toShard) {
    try {
      const result = await this.adminDb.command({
        moveChunk: namespace,
        find: findKey,
        to: toShard,
      });
      console.log(`Chunk moved to ${toShard}`);
      return result;
    } catch (error) {
      console.error("Error moving chunk:", error);
      throw error;
    }
  }

  // Balancer management
  async getBalancerState () {
    try {
      const result = await this.adminDb.command({ balancerStatus: 1 });
      return result;
    } catch (error) {
      console.warn("Falling back to legacy balancer status:", error.message);
      // Fallback for older versions
      const settings = await this.client
        .db("config")
        .collection("settings")
        .findOne({ _id: "balancer" });
      return { mode: settings?.stopped ? "off" : "on" };
    }
  }

  async stopBalancer () {
    try {
      const result = await this.adminDb.command({ balancerStop: 1 });
      console.log("Balancer stopped");
      return result;
    } catch (error) {
      console.error("Error stopping balancer:", error);
      throw error;
    }
  }

  async startBalancer () {
    try {
      const result = await this.adminDb.command({ balancerStart: 1 });
      console.log("Balancer started");
      return result;
    } catch (error) {
      console.error("Error starting balancer:", error);
      throw error;
    }
  }

  // Add shard zone
  async addShardZone (shardName, zoneName) {
    try {
      const result = await this.adminDb.command({
        addShardToZone: shardName,
        zone: zoneName,
      });
      console.log(`Shard ${shardName} added to zone ${zoneName}`);
      return result;
    } catch (error) {
      console.error("Error adding shard to zone:", error);
      throw error;
    }
  }

  // Update zone key range
  async updateZoneKeyRange (namespace, min, max, zone) {
    try {
      const result = await this.adminDb.command({
        updateZoneKeyRange: namespace,
        min: min,
        max: max,
        zone: zone,
      });
      console.log(`Zone key range updated for ${zone}`);
      return result;
    } catch (error) {
      console.error("Error updating zone key range:", error);
      throw error;
    }
  }

  // Analyze query targeting
  async analyzeQuery (dbName, collectionName, query) {
    const db = this.client.db(dbName);
    const collection = db.collection(collectionName);

    try {
      const explanation = await collection.find(query).explain("executionStats");

      // Check if query is targeted or scatter-gather
      const shards = explanation.executionStats?.executionStages?.shards;

      if (!shards) {
        return {
          targeted: false,
          message: "Collection might not be sharded or query explanation not available",
        };
      }

      const shardsQueried = Object.keys(shards).length;
      const totalShards = await this.getStatus();

      return {
        targeted: shardsQueried < totalShards.length,
        shardsQueried: shardsQueried,
        totalShards: totalShards.length,
        executionTimeMs: explanation.executionStats.executionTimeMillis,
        totalDocsExamined: explanation.executionStats.totalDocsExamined,
        totalDocsReturned: explanation.executionStats.totalDocsReturned,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Demo data generator
class ShardingDataGenerator {
  constructor (db) {
    this.db = db;
  }

  // Generate user data for sharding demo
  async generateUsers (count = 10000) {
    const users = [];
    const regions = ["NA", "EU", "APAC", "SA", "AF"];

    for (let i = 0; i < count; i++) {
      users.push({
        userId: `USER${String(i).padStart(6, "0")}`,
        username: `user_${i}`,
        email: `user${i}@example.com`,
        region: regions[Math.floor(Math.random() * regions.length)],
        age: 18 + Math.floor(Math.random() * 60),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastLogin: new Date(),
        purchaseCount: Math.floor(Math.random() * 100),
      });
    }

    const collection = this.db.collection("users");
    const result = await collection.insertMany(users);
    console.log(`Inserted ${result.insertedCount} users`);
    return result;
  }

  // Generate order data
  async generateOrders (count = 50000) {
    const orders = [];
    const userCount = 10000;

    for (let i = 0; i < count; i++) {
      const orderDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      orders.push({
        orderId: `ORD${String(i).padStart(8, "0")}`,
        customerId: `USER${String(Math.floor(Math.random() * userCount)).padStart(6, "0")}`,
        orderDate: orderDate,
        status: ["pending", "processing", "shipped", "delivered"][Math.floor(Math.random() * 4)],
        totalAmount: Math.round(Math.random() * 1000 * 100) / 100,
        items: Math.floor(Math.random() * 5) + 1,
      });
    }

    const collection = this.db.collection("orders");
    const result = await collection.insertMany(orders, { ordered: false });
    console.log(`Inserted ${result.insertedCount} orders`);
    return result;
  }

  // Generate time-series data
  async generateMetrics (count = 100000) {
    const metrics = [];
    const servers = ["server1", "server2", "server3", "server4", "server5"];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      metrics.push({
        timestamp: new Date(now - i * 60000), // 1 minute intervals
        server: servers[Math.floor(Math.random() * servers.length)],
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 1000,
      });
    }

    const collection = this.db.collection("metrics");
    const result = await collection.insertMany(metrics, { ordered: false });
    console.log(`Inserted ${result.insertedCount} metrics`);
    return result;
  }
}

// Query performance tester
class ShardingPerformanceTester {
  constructor (db) {
    this.db = db;
  }

  // Test targeted vs scatter-gather queries
  async compareQueryPerformance () {
    const results = {};
    const collection = this.db.collection("orders");

    // Targeted query (uses shard key)
    const targetedStart = Date.now();
    const targeted = await collection
      .find({
        customerId: "USER000001",
        orderDate: { $gte: new Date("2024-01-01") },
      })
      .toArray();
    results.targeted = {
      time: Date.now() - targetedStart,
      count: targeted.length,
    };

    // Scatter-gather query (doesn't use shard key)
    const scatterStart = Date.now();
    const scattered = await collection
      .find({
        totalAmount: { $gte: 500 },
      })
      .limit(100)
      .toArray();
    results.scatterGather = {
      time: Date.now() - scatterStart,
      count: scattered.length,
    };

    // Aggregation pipeline
    const aggStart = Date.now();
    const aggregated = await collection
      .aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: "$customerId", total: { $sum: "$totalAmount" } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ])
      .toArray();
    results.aggregation = {
      time: Date.now() - aggStart,
      count: aggregated.length,
    };

    return results;
  }

  // Test write distribution
  async testWriteDistribution (iterations = 1000) {
    const collection = this.db.collection("orders");
    const writeStart = Date.now();

    for (let i = 0; i < iterations; i++) {
      await collection.insertOne({
        orderId: `TEST${Date.now()}${i}`,
        customerId: `USER${String(Math.floor(Math.random() * 10000)).padStart(6, "0")}`,
        orderDate: new Date(),
        totalAmount: Math.random() * 1000,
      });
    }

    return {
      totalTime: Date.now() - writeStart,
      averageTime: (Date.now() - writeStart) / iterations,
      operations: iterations,
    };
  }
}

module.exports = {
  ShardingManager,
  ShardingDataGenerator,
  ShardingPerformanceTester,
};
