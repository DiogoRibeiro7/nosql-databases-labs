// 07-most-popular-cuisine-per-city.js
// Q7: most popular cuisine per city
// Usage: node 07-most-popular-cuisine-per-city.js

const { getDb, closeDb } = require('../../src/db');
const { getMostPopularCuisinePerCity } = require('../restaurantQueries');

(async function main() {
  const db = await getDb();
  try {
    const res = await getMostPopularCuisinePerCity(db);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();