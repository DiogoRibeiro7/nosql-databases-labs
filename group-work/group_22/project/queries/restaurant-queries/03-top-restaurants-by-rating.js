// 03-top-restaurants-by-rating.js
// Q3: top N restaurants by rating
// Usage: node 03-top-restaurants-by-rating.js [limit]

const { getDb, closeDb } = require('../../src/db');
const { getTopRestaurantsByRating } = require('../restaurantQueries');

(async function main() {
  const db = await getDb();
  try {
    const limit = parseInt(process.argv[2], 10) || 5;
    const res = await getTopRestaurantsByRating(db, limit);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();