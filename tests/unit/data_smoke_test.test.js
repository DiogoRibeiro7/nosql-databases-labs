const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { serialize } = require("bson");

const {
  countJsonArray,
  countNdjson,
  countBson,
  validateDataset,
} = require("../../scripts/data-smoke-test");

const rootDir = path.join(__dirname, "..", "..");
const tmpDir = path.join(rootDir, "tests", "__data_smoke_tmp__");

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

test("countJsonArray counts items and rejects invalid input", async () => {
  await cleanup();
  const jsonPath = await writeFile("array.json", JSON.stringify([{ a: 1 }, { b: 2 }]));
  const count = await countJsonArray(jsonPath);
  assert.equal(count, 2);

  const objPath = await writeFile("object.json", JSON.stringify({ a: 1 }));
  await assert.rejects(() => countJsonArray(objPath), /does not contain an array/);

  const badPath = await writeFile("bad.json", "{");
  await assert.rejects(() => countJsonArray(badPath), /Invalid JSON array/);
});

test("countNdjson counts valid lines and errors on invalid JSON", async () => {
  await cleanup();
  const ndjsonPath = await writeFile(
    "data.ndjson",
    `{"a":1}\n\n{"b":2}\n`
  );
  const count = await countNdjson(ndjsonPath);
  assert.equal(count, 2);

  const badPath = await writeFile("bad.ndjson", `{"a":1}\n{bad}\n`);
  await assert.rejects(() => countNdjson(badPath), /Invalid JSON on line 2/);
});

test("countBson counts documents and validates sizes", async () => {
  await cleanup();
  const doc1 = serialize({ a: 1 });
  const doc2 = serialize({ b: 2 });
  const buffer = Buffer.concat([doc1, doc2]);
  const bsonPath = await writeFile("data.bson", buffer, true);
  const count = countBson(bsonPath);
  assert.equal(count, 2);

  const badBuffer = Buffer.from([0x01, 0x00]); // too small to read size
  const badPath = await writeFile("bad.bson", badBuffer, true);
  assert.throws(() => countBson(badPath), /Unexpected EOF/);
});

test("validateDataset checks formats and expected counts", async () => {
  await cleanup();
  const jsonPath = await writeFile("validate.json", JSON.stringify([{ a: 1 }]));
  const relative = path.relative(rootDir, jsonPath);

  const count = await validateDataset({
    path: relative,
    format: "json-array",
    expectedCount: 1,
  });
  assert.equal(count, 1);

  await assert.rejects(
    () =>
      validateDataset({
        path: relative,
        format: "json-array",
        expectedCount: 2,
      }),
    /Expected 2 docs but found 1/
  );

  await assert.rejects(
    () =>
      validateDataset({
        path: "missing.json",
        format: "json-array",
      }),
    /File is missing/
  );

  await assert.rejects(
    () =>
      validateDataset({
        path: relative,
        format: "unknown",
      }),
    /Unsupported format/
  );
});
