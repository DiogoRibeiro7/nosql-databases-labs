// 08-best-value-restaurants.js
// Q8: best value restaurants
// Usage: node 08-best-value-restaurants.js

const { getDb, closeDb } = require('../../src/db');
const { getBestValueRestaurants } = require('../restaurantQueries');

(async function main() {
  const db = await getDb();
  try {
    const res = await getBestValueRestaurants(db);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();