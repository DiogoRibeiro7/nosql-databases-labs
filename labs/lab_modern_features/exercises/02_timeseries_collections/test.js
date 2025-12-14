#!/usr/bin/env node

const assert = require('assert');
const path = require('path');

const Solution = require(path.join(__dirname, 'solution.js'));

const instance = new Solution(process.env.MONGODB_URI || 'mongodb://localhost:27017');

['connect', 'createTimeSeriesCollection', 'insertTimeSeriesData', 'queryTimeSeriesData', 'cleanup'].forEach(method => {
  assert.strictEqual(typeof instance[method], 'function', `Method ${method}() is missing in time-series solution`);
});

console.log('Time-Series exercise scaffold verified. Extend test.js to cover your pipelines.');
