const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const { validateGroup, validateMongoQueries } = require("../../scripts/validate_groups");

const rootDir = path.join(__dirname, "..", "..");
const groupsDir = path.join(rootDir, "group-work");

function uniqueGroupName(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function cleanupGroup(groupName) {
  const groupPath = path.join(groupsDir, groupName);
  await fs.rm(groupPath, { recursive: true, force: true });
}

function largeContent(base, minBytes) {
  const pad = "x".repeat(Math.max(0, minBytes - Buffer.byteLength(base, "utf8")));
  return base + pad;
}

test("validateMongoQueries detects query patterns", async () => {
  const groupName = uniqueGroupName("group_queries");
  const groupPath = path.join(groupsDir, groupName);
  const solutionPath = path.join(groupPath, "solution.md");

  const content = `
db.users.find({})
db.sales.aggregate([{ $group: { _id: "$category" } }])
db.users.createIndex({ email: 1 })
db.users.updateOne({ _id: 1 }, { $set: { active: true } })
db.users.deleteOne({ _id: 2 })
`;

  await writeFile(solutionPath, content);
  const result = validateMongoQueries(solutionPath);

  assert.equal(result.hasQueries, true);
  assert.equal(result.queryCount, 5);
  assert.ok(result.queryTypes.find >= 1);
  assert.ok(result.queryTypes.aggregate >= 1);
  assert.ok(result.queryTypes.createIndex >= 1);
  assert.equal(result.hasAdvancedQueries, true);

  await cleanupGroup(groupName);
});

test("validateMongoQueries returns empty result when file missing", () => {
  const missingPath = path.join(groupsDir, "missing_group", "solution.md");
  const result = validateMongoQueries(missingPath);
  assert.equal(result.hasQueries, false);
  assert.equal(result.queryCount, 0);
});

test("validateGroup returns missing when directory not found", () => {
  const result = validateGroup("group_does_not_exist");
  assert.equal(result.status, "missing");
  assert.match(result.message, /not found/i);
});

test("validateGroup reports warning when markdown lacks headings", async () => {
  const groupName = uniqueGroupName("group_warning");
  const groupPath = path.join(groupsDir, groupName);

  const readme = largeContent(
    "This file has content but no headings.\n\nLine 2\n\nLine 3\n\nLine 4\n\nLine 5\n",
    600
  );
  const solution = largeContent(
    "Solution content without headings.\n\nLine 2\n\nLine 3\n\nLine 4\n\nLine 5\n",
    1100
  );

  await writeFile(path.join(groupPath, "README.md"), readme);
  await writeFile(path.join(groupPath, "solution.md"), solution);

  const result = validateGroup(groupName);
  assert.equal(result.status, "warning");
  assert.ok(result.warnings.length > 0);

  await cleanupGroup(groupName);
});

test("validateGroup accepts valid group with queries and optional files", async () => {
  const groupName = uniqueGroupName("group_valid");
  const groupPath = path.join(groupsDir, groupName);

  const readmeBase = `# Group Title

## Members
- Student A
- Student B

## Overview
This group solved the lab.

## Resources
See [MongoDB](https://www.mongodb.com).

\`\`\`js
console.log("hello");
\`\`\`
`;
  const solutionBase = `# Solution

## Query 1
\`\`\`javascript
db.users.find({})
\`\`\`

## Query 2
\`\`\`javascript
db.sales.aggregate([{ $group: { _id: "$category" } }])
\`\`\`

## Query 3
\`\`\`javascript
db.users.createIndex({ email: 1 })
\`\`\`
`;

  await writeFile(
    path.join(groupPath, "README.md"),
    largeContent(readmeBase, 600)
  );
  await writeFile(
    path.join(groupPath, "solution.md"),
    largeContent(solutionBase, 1200)
  );
  await writeFile(path.join(groupPath, "queries.js"), "db.users.find({})");
  await fs.writeFile(path.join(groupPath, "diagram.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));

  const result = validateGroup(groupName);
  assert.equal(result.status, "valid");
  assert.equal(result.files["README.md"].status, "valid");
  assert.equal(result.files["solution.md"].status, "valid");
  assert.equal(result.files["queries.js"].status, "present");
  assert.equal(result.files.images.status, "present");
  assert.ok(result.queries.queryCount >= 3);

  await cleanupGroup(groupName);
});
