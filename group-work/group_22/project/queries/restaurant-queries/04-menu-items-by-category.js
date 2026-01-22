// 04-menu-items-by-category.js
// Q4: menu items by category for a given restaurant
// Usage: node 04-menu-items-by-category.js [restaurantId] [category]

const { getDb, closeDb } = require('../../src/db');
const { getMenuItemsByCategory } = require('../restaurantQueries');
const { ObjectId } = require('mongodb');

(async function main() {
  const db = await getDb();
  try {
    let restaurantIdArg = process.argv[2];
    const category = process.argv[3] || 'Main';

    let restaurantId;
    if (restaurantIdArg) {
      try {
        restaurantId = new ObjectId(restaurantIdArg);
      } catch (e) {
        console.error('Invalid restaurantId provided');
        process.exit(1);
      }
    } else {
      const r = await db.collection('restaurants').findOne({});
      if (!r) {
        console.log('No restaurant found in DB');
        return;
      }
      restaurantId = r._id;
      console.log(`Using first restaurant id: ${restaurantId}`);
    }

    const res = await getMenuItemsByCategory(db, restaurantId, category);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
})();