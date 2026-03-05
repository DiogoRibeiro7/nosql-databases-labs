const test = require("node:test");
const assert = require("node:assert/strict");

const { LabTestFramework, TestDataGenerator } = require("../../labs/test_framework");

test("TestDataGenerator generates users/products/orders with expected shapes", () => {
  const users = TestDataGenerator.generateUsers(5);
  assert.equal(users.length, 5);
  assert.ok(users[0].username.startsWith("user_"));
  assert.ok(users[0].email.includes("@example.com"));
  assert.ok(Number.isInteger(users[0].age));

  const products = TestDataGenerator.generateProducts(3);
  assert.equal(products.length, 3);
  assert.ok(products[0].name.startsWith("Product "));
  assert.ok(Array.isArray(products[0].tags));

  const userIds = users.map((u) => u.username);
  const productIds = products.map((p) => p.name);
  const orders = TestDataGenerator.generateOrders(4, userIds, productIds);
  assert.equal(orders.length, 4);
  assert.ok(orders[0].items.length >= 1);
  assert.ok(orders[0].total > 0);
});

test("LabTestFramework runTest records success and failure", async () => {
  const framework = new LabTestFramework({ verbose: false });

  const success = await framework.runTest("success", async () => {});
  assert.equal(success.success, true);

  const failure = await framework.runTest("failure", async () => {
    throw new Error("boom");
  });
  assert.equal(failure.success, false);

  const report = framework.generateReport();
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.passed, 1);
  assert.equal(report.summary.failed, 1);
});

test("LabTestFramework runSuite aggregates results", async () => {
  const framework = new LabTestFramework({ verbose: false });
  const suite = await framework.runSuite("demo", [
    { name: "a", fn: async () => {} },
    {
      name: "b",
      fn: async () => {
        throw new Error("fail");
      },
    },
  ]);

  assert.equal(suite.total, 2);
  assert.equal(suite.passed, 1);
  assert.equal(suite.failed, 1);
});

test("LabTestFramework assertion helpers and schema validation", async () => {
  const framework = new LabTestFramework({ verbose: false });
  const fakeDb = {
    listCollections: () => ({
      toArray: async () => [{ name: "users" }],
    }),
    collection: () => ({
      countDocuments: async () => 5,
      listIndexes: () => ({ toArray: async () => [{ name: "idx_users" }] }),
      findOne: async () => ({ name: "Alice", age: 30, tags: [] }),
    }),
  };
  framework.db = fakeDb;

  await framework.assertCollectionExists("users");
  await framework.assertDocumentCount("users", 4, ">");
  await framework.assertDocumentCount("users", 5);
  await framework.assertIndexExists("users", "idx_users");
  await framework.assertQueryResult("users", { name: "Alice" }, { name: "Alice", age: 30, tags: [] });
  await framework.validateSchema("users", { name: "string", age: "number", tags: "array" });
});

test("LabTestFramework validateSchema throws when collection is empty", async () => {
  const framework = new LabTestFramework({ verbose: false });
  framework.db = {
    collection: () => ({
      findOne: async () => null,
    }),
  };

  await assert.rejects(
    () => framework.validateSchema("missing", { field: "string" }),
    /No documents found/
  );
});

test("LabTestFramework measurePerformance returns stats", async () => {
  const framework = new LabTestFramework({ verbose: false });
  const stats = await framework.measurePerformance(
    "noop",
    async () => {},
    { iterations: 2, warmup: 1 }
  );

  assert.equal(stats.name, "noop");
  assert.equal(stats.iterations, 2);
  assert.ok(Number.isFinite(parseFloat(stats.avg)));
  assert.ok(Number.isFinite(parseFloat(stats.p50)));
});
