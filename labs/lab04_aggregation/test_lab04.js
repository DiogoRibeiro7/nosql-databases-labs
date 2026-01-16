/**
 * Lab 04 – Aggregation Validation Suite
 * Usage: node test_lab04.js
 */

const { MongoClient } = require("mongodb");
const assert = require("assert");

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "lab04_analytics";

class Lab04AggregationTester {
  constructor() {
    this.client = new MongoClient(URI);
    this.results = { passed: 0, failed: 0 };
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(DB_NAME);
    this.sales = this.db.collection("sales");
    this.products = this.db.collection("products");
    this.customers = this.db.collection("customers");
  }

  async disconnect() {
    await this.client.close();
  }

  async run(name, fn) {
    process.stdout.write(`→ ${name} ... `);
    try {
      await fn();
      this.results.passed++;
      console.log("✓");
    } catch (error) {
      this.results.failed++;
      console.error("✗", error.message);
      throw error;
    }
  }

  async verifyCounts() {
    await this.run("Collection counts", async () => {
      const [salesCount, productCount, customerCount] = await Promise.all([
        this.sales.countDocuments(),
        this.products.countDocuments(),
        this.customers.countDocuments(),
      ]);

      assert.strictEqual(salesCount, 200, "Sales collection should have 200 docs");
      assert.strictEqual(productCount, 30, "Products collection should have 30 docs");
      assert.strictEqual(customerCount, 50, "Customers collection should have 50 docs");
    });
  }

  async verifyIndexes() {
    await this.run("Index coverage", async () => {
      const salesIndexes = (await this.sales.indexes()).map((idx) => idx.name);
      const productIndexes = (await this.products.indexes()).map((idx) => idx.name);
      const customerIndexes = (await this.customers.indexes()).map((idx) => idx.name);

      ["date_1", "customer_id_1", "product_id_1", "date_customer"].forEach((name) => {
        assert(salesIndexes.includes(name), `Missing sales index: ${name}`);
      });

      ["product_id_1", "category_1", "supplier_1"].forEach((name) => {
        assert(productIndexes.includes(name), `Missing products index: ${name}`);
      });

      ["customer_id_1", "segment_1", "country_1"].forEach((name) => {
        assert(customerIndexes.includes(name), `Missing customers index: ${name}`);
      });
    });
  }

  async verifyMonthlyRevenue() {
    await this.run("Monthly revenue aggregation", async () => {
      const monthly = await this.sales
        .aggregate([
          {
            $project: {
              month: { $substr: ["$date", 0, 7] },
              total_amount: 1,
            },
          },
          {
            $group: {
              _id: "$month",
              revenue: { $sum: "$total_amount" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      assert(monthly.length >= 12, "Expected at least 12 monthly revenue entries");

      const monthlyTotal = monthly.reduce((sum, m) => sum + m.revenue, 0);
      const total = await this.sales
        .aggregate([{ $group: { _id: null, revenue: { $sum: "$total_amount" } } }])
        .toArray();

      assert(
        Math.abs(monthlyTotal - total[0].revenue) < 0.01,
        "Monthly totals do not match grand total"
      );
    });
  }

  async verifyTopCustomers() {
    await this.run("Top customers aggregation", async () => {
      const topCustomers = await this.sales
        .aggregate([
          {
            $group: {
              _id: "$customer_id",
              total_spent: { $sum: "$total_amount" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { total_spent: -1 } },
          { $limit: 5 },
        ])
        .toArray();

      assert.strictEqual(topCustomers.length, 5, "Expected 5 top customers");
      assert(
        topCustomers[0].total_spent >= topCustomers[4].total_spent,
        "Top customers not sorted properly"
      );
    });
  }

  async verifyProductPerformance() {
    await this.run("Product performance aggregation", async () => {
      const productPerformance = await this.sales
        .aggregate([
          {
            $group: {
              _id: "$product_id",
              unitsSold: { $sum: "$quantity" },
              totalRevenue: { $sum: "$total_amount" },
              totalProfit: { $sum: "$profit" },
            },
          },
          {
            $addFields: {
              avgOrderValue: { $divide: ["$totalRevenue", "$unitsSold"] },
            },
          },
          { $sort: { totalRevenue: -1 } },
          { $limit: 10 },
        ])
        .toArray();

      assert(productPerformance.length === 10, "Expected top 10 products");
      productPerformance.forEach((doc) => {
        assert(doc.unitsSold > 0, "Units sold should be positive");
        assert(doc.totalProfit >= 0, "Total profit should be positive");
      });
    });
  }

  async verifyCustomerSegmentation() {
    await this.run("Customer segmentation aggregation", async () => {
      const segments = await this.customers
        .aggregate([
          {
            $lookup: {
              from: "sales",
              localField: "customer_id",
              foreignField: "customer_id",
              as: "orders",
            },
          },
          { $unwind: "$orders" },
          {
            $group: {
              _id: "$segment",
              customers: { $addToSet: "$customer_id" },
              totalRevenue: { $sum: "$orders.total_amount" },
            },
          },
        ])
        .toArray();

      assert(segments.length > 0, "No customer segments found");
      segments.forEach((segment) => {
        assert(segment.customers.length > 0, "Segment must include customers");
        assert(segment.totalRevenue >= 0, "Segment revenue must be non-negative");
      });
    });
  }

  async verifyDataIntegrity() {
    await this.run("Cross-collection integrity", async () => {
      const orphanSales = await this.sales
        .aggregate([
          {
            $lookup: {
              from: "customers",
              localField: "customer_id",
              foreignField: "customer_id",
              as: "customer",
            },
          },
          { $match: { customer: { $size: 0 } } },
        ])
        .toArray();

      assert.strictEqual(orphanSales.length, 0, "All sales must reference valid customers");

      const orphanProducts = await this.sales
        .aggregate([
          {
            $lookup: {
              from: "products",
              localField: "product_id",
              foreignField: "product_id",
              as: "product",
            },
          },
          { $match: { product: { $size: 0 } } },
        ])
        .toArray();

      assert.strictEqual(orphanProducts.length, 0, "All sales must reference valid products");
    });
  }

  async runAll() {
    await this.connect();
    try {
      await this.verifyCounts();
      await this.verifyIndexes();
      await this.verifyMonthlyRevenue();
      await this.verifyTopCustomers();
      await this.verifyProductPerformance();
      await this.verifyCustomerSegmentation();
      await this.verifyDataIntegrity();
    } finally {
      await this.disconnect();
    }

    console.log("\nLab 04 aggregation tests completed.");
    console.log(`Passed: ${this.results.passed}, Failed: ${this.results.failed}`);
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new Lab04AggregationTester().runAll().catch((error) => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
}

module.exports = Lab04AggregationTester;
