const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const {
  runCommand,
  parseArgs,
  ensureMongoConnection,
} = require("../../scripts/run_lab_tests");

test("parseArgs normalizes lab identifiers", () => {
  const parsed = parseArgs(["--lab=Lab04"]);
  assert.equal(parsed.lab, "lab04");
});

test("parseArgs returns empty object when no args supplied", () => {
  const parsed = parseArgs([]);
  assert.deepEqual(parsed, {});
});

test("runCommand reports success", () => {
  const step = { title: "Example", cmd: "node", args: ["-v"] };
  const spawn = () => ({ status: 0 });

  const logMock = mock.method(console, "log", () => {});
  const result = runCommand(step, { spawn });
  logMock.mock.restore();

  assert.deepEqual(result, { skipped: false, status: 0 });
});

test("runCommand skips step when spawn fails but skipMessage exists", () => {
  const step = {
    title: "Optional step",
    cmd: "node",
    args: ["some-script.js"],
    skipMessage: "Skipping due to missing replica set",
  };
  const spawn = () => ({ status: 1 });

  const warnMock = mock.method(console, "warn", () => {});
  const logMock = mock.method(console, "log", () => {});
  const result = runCommand(step, { spawn });
  warnMock.mock.restore();
  logMock.mock.restore();

  assert.deepEqual(result, { skipped: true, status: 0 });
});

test("ensureMongoConnection resolves true when ping succeeds", async () => {
  const events = [];
  class FakeClient {
    async connect() {
      events.push("connect");
    }
    db() {
      return {
        command: async () => {
          events.push("ping");
        },
      };
    }
    async close() {
      events.push("close");
    }
  }

  const result = await ensureMongoConnection("mongodb://example", () => new FakeClient());

  assert.equal(result, true);
  assert.deepEqual(events, ["connect", "ping", "close"]);
});

test("ensureMongoConnection resolves false when client errors", async () => {
  const events = [];
  class BrokenClient {
    async connect() {
      events.push("connect");
      throw new Error("boom");
    }
    db() {
      return {
        command: async () => {
          events.push("ping");
        },
      };
    }
    async close() {
      events.push("close");
    }
  }

  const result = await ensureMongoConnection("mongodb://example", () => new BrokenClient());

  assert.equal(result, false);
  assert.deepEqual(events, ["connect", "close"]);
});
