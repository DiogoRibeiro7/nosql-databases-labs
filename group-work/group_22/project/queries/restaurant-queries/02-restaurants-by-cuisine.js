// 02-restaurants-by-cuisine.js
// Q2: restaurants by cuisine
// Usage: node 02-restaurants-by-cuisine.js [cuisineType]

const { getDb, closeDb } = require('../../src/db');
const { getRestaurantsByCuisineSorted } = require('../restaurantQueries');

(async function main() {
  const db = await getDb();
  try {
    const cuisine = process.argv[2] || 'Indien';
    const res = await getRestaurantsByCuisineSorted(db, cuisine);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();