const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const LabTestRunner = require("../../labs/run_all_tests");

const labsDir = path.join(__dirname, "..", "..", "labs");
const tmpDir = path.join(labsDir, "__test_tmp__");

async function writeModule(relativePath, source) {
  const filePath = path.join(tmpDir, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, source);
  return filePath;
}

async function cleanupTmp() {
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

test("runLab records passed exercises for test and exercise types", async () => {
  await cleanupTmp();

  await writeModule(
    "dummy_test.js",
    "module.exports = class DummyTest { async run() { global.__dummy_run = true; } };"
  );
  await writeModule(
    "dummy_exercise.js",
    "module.exports = class DummyExercise { async connect() { global.__dummy_connect = true; } async alpha() { global.__dummy_alpha = true; } async beta() { global.__dummy_beta = true; } async cleanup() { global.__dummy_cleanup = true; } };"
  );

  const runner = new LabTestRunner();
  await runner.runLab("99", "Dummy Lab", [
    { name: "Test Exercise", path: "__test_tmp__/dummy_test.js", type: "test" },
    { name: "Script Exercise", path: "__test_tmp__/dummy_exercise.js", type: "exercise", limit: 1 },
  ]);

  assert.equal(runner.results.summary.totalLabs, 1);
  assert.equal(runner.results.summary.passed, 1);
  assert.equal(runner.results.labs[0].status, "passed");
  assert.equal(runner.results.labs[0].exercises.length, 2);

  assert.equal(global.__dummy_run, true);
  assert.equal(global.__dummy_connect, true);
  assert.equal(global.__dummy_alpha, true);
  assert.equal(global.__dummy_beta, undefined);
  assert.equal(global.__dummy_cleanup, true);

  await cleanupTmp();
});

test("runLab marks failure when exercise file is missing", async () => {
  await cleanupTmp();

  const runner = new LabTestRunner();
  await runner.runLab("98", "Missing Lab", [
    { name: "Missing Exercise", path: "__test_tmp__/missing.js", type: "exercise" },
  ]);

  assert.equal(runner.results.summary.totalLabs, 1);
  assert.equal(runner.results.summary.failed, 1);
  assert.equal(runner.results.labs[0].status, "failed");
  assert.equal(runner.results.labs[0].exercises[0].status, "failed");

  await cleanupTmp();
});
