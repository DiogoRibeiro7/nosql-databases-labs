const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { serialize } = require("bson");

const {
  countBson,
  countNdjson,
  validateDataset,
} = require("../../scripts/data-smoke-test");

const rootDir = path.join(__dirname, "..", "..");
const tmpDir = path.join(rootDir, "tests", "__data_smoke_extra_tmp__");

async function writeFile(relativePath, content, binary = false) {
  const filePath = path.join(tmpDir, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (binary) {
    await fs.writeFile(filePath, content);
  } else {
    await fs.writeFile(filePath, content, "utf8");
  }
  return filePath;
}

async function cleanup() {
  await fs.rm(tmpDir, { recursive: true, force: true });
}

test("countBson rejects invalid sizes and malformed documents", async () => {
  await cleanup();

  const zeroSize = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  const zeroPath = await writeFile("zero.bson", zeroSize, true);
  assert.throws(() => countBson(zeroPath), /Invalid BSON document size/);

  const truncated = Buffer.from([0x0a, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03]);
  const truncPath = await writeFile("trunc.bson", truncated, true);
  assert.throws(() => countBson(truncPath), /Truncated BSON document/);

  const malformed = Buffer.from([0x06, 0x00, 0x00, 0x00, 0x01, 0x00]);
  const malformedPath = await writeFile("malformed.bson", malformed, true);
  assert.throws(() => countBson(malformedPath), /Failed to deserialize BSON document/);

  await cleanup();
});

test("countNdjson reports stream failures for missing files", async () => {
  await cleanup();
  await assert.rejects(
    () => countNdjson(path.join(tmpDir, "missing.ndjson")),
    /(Stream|Readline) failure/
  );
  await cleanup();
});

test("validateDataset handles ndjson and bson formats", async () => {
  await cleanup();

  const ndjsonPath = await writeFile("data.ndjson", `{"a":1}\n{"b":2}\n`);
  const ndjsonRelative = path.relative(rootDir, ndjsonPath);
  const ndjsonCount = await validateDataset({
    path: ndjsonRelative,
    format: "ndjson",
  });
  assert.equal(ndjsonCount, 2);

  const bsonDoc1 = serialize({ a: 1 });
  const bsonDoc2 = serialize({ b: 2 });
  const bsonPath = await writeFile(
    "data.bson",
    Buffer.concat([bsonDoc1, bsonDoc2]),
    true
  );
  const bsonRelative = path.relative(rootDir, bsonPath);
  const bsonCount = await validateDataset({
    path: bsonRelative,
    format: "bson",
  });
  assert.equal(bsonCount, 2);

  await cleanup();
});
