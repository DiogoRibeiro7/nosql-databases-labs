import { describe, test, expect, beforeAll } from "@jest/globals";
import { faker } from "@faker-js/faker";
import * as dataGenerators from "./test_helpers.js";

// Set locale for tests
faker.locale = "pt_PT";

describe("Data Generation Tests", () => {
  describe("User Generation", () => {
    test("should generate correct number of users", () => {
      const users = dataGenerators.generateUsers(5);
      expect(users).toHaveLength(5);
    });

    test("should generate valid user structure", () => {
      const users = dataGenerators.generateUsers(1);
      const user = users[0];

      // Check required fields
      expect(user).toHaveProperty("_id");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("profile");
      expect(user).toHaveProperty("account");
      expect(user).toHaveProperty("tags");
      expect(user).toHaveProperty("metadata");
    });

    test("should generate valid email addresses", () => {
      const users = dataGenerators.generateUsers(10);
      const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;

      users.forEach(user => {
        expect(user.email).toMatch(emailRegex);
      });
    });

    test("should generate valid account types", () => {
      const users = dataGenerators.generateUsers(20);
      const validTypes = ["free", "premium", "enterprise"];

      users.forEach(user => {
        expect(validTypes).toContain(user.account.type);
      });
    });

    test("should generate valid coordinates", () => {
      const users = dataGenerators.generateUsers(5);

      users.forEach(user => {
        const coords = user.profile.address.coordinates.coordinates;
        expect(coords).toHaveLength(2);
        expect(coords[0]).toBeGreaterThanOrEqual(-180);
        expect(coords[0]).toBeLessThanOrEqual(180);
        expect(coords[1]).toBeGreaterThanOrEqual(-90);
        expect(coords[1]).toBeLessThanOrEqual(90);
      });
    });
  });

  describe("Product Generation", () => {
    test("should generate correct number of products", () => {
      const products = dataGenerators.generateProducts(10);
      expect(products).toHaveLength(10);
    });

    test("should generate valid product structure", () => {
      const products = dataGenerators.generateProducts(1);
      const product = products[0];

      expect(product).toHaveProperty("sku");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("category");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("inventory");
      expect(product).toHaveProperty("ratings");
    });

    test("should generate valid prices", () => {
      const products = dataGenerators.generateProducts(20);

      products.forEach(product => {
        expect(product.price.amount).toBeGreaterThan(0);
        expect(product.price.currency).toBe("EUR");
        expect(product.price.discount).toBeGreaterThanOrEqual(0);
        expect(product.price.discount).toBeLessThanOrEqual(100);
      });
    });

    test("should generate valid ratings", () => {
      const products = dataGenerators.generateProducts(20);

      products.forEach(product => {
        expect(product.ratings.average).toBeGreaterThanOrEqual(1);
        expect(product.ratings.average).toBeLessThanOrEqual(5);
        expect(product.ratings.count).toBeGreaterThanOrEqual(0);
      });
    });

    test("should generate valid categories", () => {
      const products = dataGenerators.generateProducts(50);
      const validCategories = [
        "Electronics",
        "Books",
        "Clothing",
        "Home & Garden",
        "Sports",
        "Toys",
      ];

      products.forEach(product => {
        expect(validCategories).toContain(product.category);
      });
    });
  });

  describe("Transaction Generation", () => {
    let users, products;

    beforeAll(() => {
      users = dataGenerators.generateUsers(5);
      products = dataGenerators.generateProducts(10);
    });

    test("should generate correct number of transactions", () => {
      const transactions = dataGenerators.generateTransactions(users, products, 15);
      expect(transactions).toHaveLength(15);
    });

    test("should generate valid transaction structure", () => {
      const transactions = dataGenerators.generateTransactions(users, products, 1);
      const transaction = transactions[0];

      expect(transaction).toHaveProperty("orderId");
      expect(transaction).toHaveProperty("userId");
      expect(transaction).toHaveProperty("status");
      expect(transaction).toHaveProperty("items");
      expect(transaction).toHaveProperty("payment");
      expect(transaction).toHaveProperty("shipping");
      expect(transaction).toHaveProperty("totals");
      expect(transaction).toHaveProperty("timestamps");
    });

    test("should reference valid users", () => {
      const transactions = dataGenerators.generateTransactions(users, products, 20);
      const userIds = users.map(u => u._id);

      transactions.forEach(transaction => {
        expect(userIds).toContain(transaction.userId);
      });
    });

    test("should reference valid products", () => {
      const transactions = dataGenerators.generateTransactions(users, products, 20);
      const productSkus = products.map(p => p.sku);

      transactions.forEach(transaction => {
        transaction.items.forEach(item => {
          expect(productSkus).toContain(item.productSku);
        });
      });
    });

    test("should calculate totals correctly", () => {
      const transactions = dataGenerators.generateTransactions(users, products, 10);

      transactions.forEach(transaction => {
        const calculatedSubtotal = transaction.items.reduce((sum, item) => sum + item.total, 0);
        expect(Math.abs(calculatedSubtotal - transaction.totals.subtotal)).toBeLessThan(0.01);

        const expectedTax = transaction.totals.subtotal * 0.23;
        expect(Math.abs(expectedTax - transaction.totals.tax)).toBeLessThan(0.01);

        const expectedTotal =
          transaction.totals.subtotal + transaction.totals.tax + transaction.totals.shipping;
        expect(Math.abs(expectedTotal - transaction.totals.total)).toBeLessThan(0.01);
      });
    });

    test("should generate valid payment methods", () => {
      const transactions = dataGenerators.generateTransactions(users, products, 20);
      const validMethods = ["credit_card", "debit_card", "paypal", "mbway", "bank_transfer"];

      transactions.forEach(transaction => {
        expect(validMethods).toContain(transaction.payment.method);
      });
    });
  });

  describe("Log Generation", () => {
    let users;

    beforeAll(() => {
      users = dataGenerators.generateUsers(5);
    });

    test("should generate correct number of logs", () => {
      const logs = dataGenerators.generateLogs(users, 100);
      expect(logs).toHaveLength(100);
    });

    test("should generate valid log structure", () => {
      const logs = dataGenerators.generateLogs(users, 1);
      const log = logs[0];

      expect(log).toHaveProperty("timestamp");
      expect(log).toHaveProperty("level");
      expect(log).toHaveProperty("type");
      expect(log).toHaveProperty("sessionId");
      expect(log).toHaveProperty("message");
      expect(log).toHaveProperty("metadata");
    });

    test("should generate valid log levels", () => {
      const logs = dataGenerators.generateLogs(users, 50);
      const validLevels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];

      logs.forEach(log => {
        expect(validLevels).toContain(log.level);
      });
    });

    test("should generate valid timestamps", () => {
      const logs = dataGenerators.generateLogs(users, 20);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      logs.forEach(log => {
        const timestamp = new Date(log.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).toBeLessThanOrEqual(now.getTime());
        expect(timestamp.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime());
      });
    });

    test("should generate valid HTTP status codes", () => {
      const logs = dataGenerators.generateLogs(users, 50);
      const validStatusCodes = [200, 201, 400, 401, 403, 404, 500];

      logs.forEach(log => {
        expect(validStatusCodes).toContain(log.metadata.statusCode);
      });
    });
  });
});
