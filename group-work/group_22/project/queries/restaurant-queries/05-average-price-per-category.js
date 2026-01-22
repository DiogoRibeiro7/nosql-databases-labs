// 05-average-price-per-category.js
// Q5: average price per category
// Usage: node 05-average-price-per-category.js

const { getDb, closeDb } = require('../../src/db');
const { getAveragePricePerCategory } = require('../restaurantQueries');

(async function main() {
  const db = await getDb();
  try {
    const res = await getAveragePricePerCategory(db);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();