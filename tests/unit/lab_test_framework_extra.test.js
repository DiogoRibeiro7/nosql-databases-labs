const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const { LabTestFramework } = require("../../labs/test_framework");

const rootDir = path.join(__dirname, "..", "..");
const tmpDir = path.join(rootDir, "tests", "__framework_tmp__");

async function cleanup() {
  await fs.rm(tmpDir, { recursive: true, force: true });
}

test("assertDocumentCount supports comparison operators and failures", async () => {
  const framework = new LabTestFramework({ verbose: false });
  framework.db = {
    collection: () => ({
      countDocuments: async () => 10,
    }),
  };

  await framework.assertDocumentCount("users", 5, ">");
  await framework.assertDocumentCount("users", 10, ">=");
  await framework.assertDocumentCount("users", 11, "<");
  await framework.assertDocumentCount("users", 10, "<=");
  await framework.assertDocumentCount("users", 10);

  await assert.rejects(
    () => framework.assertDocumentCount("users", 12, ">="),
    /Expected >= 12/
  );
});

test("validateSchema accepts any type and validates strict types", async () => {
  const framework = new LabTestFramework({ verbose: false });
  framework.db = {
    collection: () => ({
      findOne: async () => ({
        name: "Alice",
        age: 33,
        meta: { team: "A" },
      }),
    }),
  };

  await framework.validateSchema("users", {
    name: "string",
    age: "number",
    meta: "any",
  });
});

test("runTest reports timeout failures", async () => {
  const framework = new LabTestFramework({ verbose: false });
  const result = await framework.runTest(
    "slow-test",
    () => new Promise((resolve) => setTimeout(resolve, 20)),
    { timeout: 5 }
  );

  assert.equal(result.success, false);
  assert.match(result.error, /Test timeout/);
});

test("generateReport summarizes results and saveReport writes file", async () => {
  await cleanup();
  await fs.mkdir(tmpDir, { recursive: true });

  const framework = new LabTestFramework({ verbose: false });
  framework.results = [
    { test: "a", status: "PASSED", duration: 10 },
    { test: "b", status: "FAILED", duration: 30, error: "boom" },
  ];

  const report = framework.generateReport();
  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.passed, 1);
  assert.equal(report.summary.failed, 1);
  assert.equal(report.summary.successRate, "50.00%");
  assert.equal(report.summary.averageDuration, "20.00ms");

  const reportPath = path.join(tmpDir, "report.json");
  await framework.saveReport(reportPath);

  const raw = await fs.readFile(reportPath, "utf8");
  const parsed = JSON.parse(raw);
  assert.equal(parsed.summary.total, 2);

  await cleanup();
});
