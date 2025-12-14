#!/usr/bin/env node

const assert = require('assert');
const path = require('path');

const Solution = require(path.join(__dirname, 'solution.js'));
const instance = new Solution(process.env.MONGODB_URI || 'mongodb://localhost:27017');

['connect', 'createSampleFiles', 'uploadFiles', 'listFiles', 'downloadFiles', 'cleanup'].forEach(method => {
  assert.strictEqual(typeof instance[method], 'function', `GridFS solution missing ${method}()`);
});

console.log('GridFS exercise structure verified.');
