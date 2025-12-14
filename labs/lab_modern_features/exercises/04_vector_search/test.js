#!/usr/bin/env node

const assert = require('assert');
const path = require('path');

const Solution = require(path.join(__dirname, 'solution.js'));
const instance = new Solution(process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017');

[
  'connect',
  'createProductEmbeddings',
  'semanticProductSearch',
  'documentEmbeddings',
  'imageSimilaritySearch',
  'recommendationSystem',
  'hybridSearch',
  'ragPattern',
  'cleanup'
].forEach(method => {
  assert.strictEqual(typeof instance[method], 'function', `Vector search solution missing ${method}()`);
});

console.log('Vector Search exercise structure verified.');
