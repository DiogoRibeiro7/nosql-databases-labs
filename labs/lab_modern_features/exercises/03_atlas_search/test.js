#!/usr/bin/env node

const assert = require('assert');
const path = require('path');

const Solution = require(path.join(__dirname, 'solution.js'));

const instance = new Solution(process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017');

[
  'connect',
  'prepareSearchData',
  'basicTextSearch',
  'autocompleteSearch',
  'facetedSearch',
  'cleanup'
].forEach(method => {
  assert.strictEqual(typeof instance[method], 'function', `Atlas Search solution missing ${method}()`);
});

console.log('Atlas Search exercise structure verified.');
