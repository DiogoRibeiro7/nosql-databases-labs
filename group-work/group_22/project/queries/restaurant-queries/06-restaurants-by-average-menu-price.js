// 06-restaurants-by-average-menu-price.js
// Q6: restaurants by average menu price
// Usage: node 06-restaurants-by-average-menu-price.js

const { getDb, closeDb } = require('../../src/db');
const { getRestaurantsByAverageMenuPrice } = require('../restaurantQueries');

(async function main() {
  const db = await getDb();
  try {
    const res = await getRestaurantsByAverageMenuPrice(db);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();