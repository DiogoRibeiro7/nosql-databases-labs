#!/usr/bin/env node

/**
 * Smoke test for the Change Streams exercise.
 * Verifies that the exported class exposes the expected hooks.
 */

const assert = require("assert");
const path = require("path");

const Solution = require(path.join(__dirname, "solution.js"));

function hasMethod(instance, name) {
  assert.strictEqual(typeof instance[name], "function", `Expected method ${name}() to exist`);
}

(async () => {
  const instance = new Solution(process.env.MONGODB_URI || "mongodb://localhost:27017");
  hasMethod(instance, "connect");
  hasMethod(instance, "basicChangeStream");
  hasMethod(instance, "filteredChangeStream");
  hasMethod(instance, "resumableChangeStream");
  hasMethod(instance, "cleanup");

  console.log("Change Streams exercise structure looks good. Add your own assertions here!");
})();
