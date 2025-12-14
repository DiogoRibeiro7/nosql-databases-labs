#!/usr/bin/env node

const assert = require('assert');
const path = require('path');

const Solution = require(path.join(__dirname, 'solution.js'));
const instance = new Solution(process.env.MONGODB_URI || 'mongodb://localhost:27017');

[
  'connect',
  'prepareSalesData',
  'prepareMetricsData',
  'prepareCustomerData',
  'prepareFinancialData',
  'prepareIoTData',
  'chartsConfigurationGuide',
  'cleanup'
].forEach(method => {
  assert.strictEqual(typeof instance[method], 'function', `Charts solution missing ${method}()`);
});

console.log('Charts exercise structure verified.');
