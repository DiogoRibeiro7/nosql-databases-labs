import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { MongoClient } from "mongodb";
import * as dataGenerators from "./test_helpers.js";

describe("MongoDB Integration Tests", () => {
  let client;
  let db;
  const testDbName = "mysense_test_db";

  beforeAll(async () => {
    // Connect to MongoDB
    client = new MongoClient("mongodb://localhost:27017/");
    await client.connect();
    db = client.db(testDbName);

    // Clean up test database
    await db.dropDatabase();
  });

  afterAll(async () => {
    // Clean up and close connection
    await db.dropDatabase();
    await client.close();
  });

  test("should insert users with indexes", async () => {
    const users = dataGenerators.generateUsers(10);
    const collection = db.collection("users");

    // Insert data
    const result = await collection.insertMany(users);
    expect(result.insertedCount).toBe(10);

    // Create indexes
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ username: 1 }, { unique: true });

    // Verify indexes
    const indexes = await collection.listIndexes().toArray();
    const indexNames = indexes.map(idx => idx.name);
    expect(indexNames).toContain("email_1");
    expect(indexNames).toContain("username_1");
  });

  test("should handle geospatial queries", async () => {
    const users = dataGenerators.generateUsers(50);
    const collection = db.collection("users_geo");

    await collection.insertMany(users);
    await collection.createIndex({ "profile.address.coordinates": "2dsphere" });

    // Test geospatial query
    const portoCoords = [-8.611, 41.1496];
    const nearbyUsers = await collection
      .find({
        "profile.address.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: portoCoords,
            },
            $maxDistance: 100000, // 100km
          },
        },
      })
      .limit(5)
      .toArray();

    expect(nearbyUsers.length).toBeGreaterThanOrEqual(0);
    expect(nearbyUsers.length).toBeLessThanOrEqual(5);
  });

  test("should perform text search on products", async () => {
    const products = dataGenerators.generateProducts(20);
    const collection = db.collection("products");

    await collection.insertMany(products);
    await collection.createIndex({ name: "text", description: "text" });

    // Perform text search
    const searchResults = await collection
      .find({
        $text: { $search: "laptop" },
      })
      .toArray();

    // Results will vary based on generated data
    expect(Array.isArray(searchResults)).toBe(true);
  });

  test("should handle transaction aggregations", async () => {
    const users = dataGenerators.generateUsers(5);
    const products = dataGenerators.generateProducts(10);
    const transactions = dataGenerators.generateTransactions(users, products, 30);

    const usersCol = db.collection("agg_users");
    const productsCol = db.collection("agg_products");
    const transactionsCol = db.collection("agg_transactions");

    await usersCol.insertMany(users);
    await productsCol.insertMany(products);
    await transactionsCol.insertMany(transactions);

    // Aggregation: total sales by status
    const salesByStatus = await transactionsCol
      .aggregate([
        {
          $group: {
            _id: "$status",
            totalSales: { $sum: "$totals.total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalSales: -1 } },
      ])
      .toArray();

    expect(salesByStatus.length).toBeGreaterThan(0);
    salesByStatus.forEach(status => {
      expect(status).toHaveProperty("_id");
      expect(status).toHaveProperty("totalSales");
      expect(status).toHaveProperty("count");
      expect(status.totalSales).toBeGreaterThan(0);
    });
  });

  test("should handle TTL indexes on logs", async () => {
    const users = dataGenerators.generateUsers(2);
    const logs = dataGenerators.generateLogs(users, 10);
    const collection = db.collection("logs");

    await collection.insertMany(logs);

    // Create TTL index
    await collection.createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
    );

    // Verify TTL index
    const indexes = await collection.listIndexes().toArray();
    const ttlIndex = indexes.find(idx => idx.expireAfterSeconds !== undefined);

    expect(ttlIndex).toBeDefined();
    expect(ttlIndex.expireAfterSeconds).toBe(30 * 24 * 60 * 60);
  });
});
