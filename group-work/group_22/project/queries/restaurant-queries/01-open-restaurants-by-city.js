// 01-open-restaurants-by-city.js
// Q1: open restaurants in a city
// Usage: node 01-open-restaurants-by-city.js [city]

const { getDb, closeDb } = require('../../src/db');
const { getOpenRestaurantsByCity } = require('../restaurantQueries');

(async function main() {
  const db = await getDb();
  try {
    const city = process.argv[2] || 'Lyon';
    const res = await getOpenRestaurantsByCity(db, city);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();