const { closeDb } = require("./db");
const { findRestaurantsByCity } = require("./restaurantsCrud");
const { findMenuItemsByRestaurant } = require("./menuItemsCrud");

async function run() {
  const parisRestaurants = await findRestaurantsByCity("Paris");
  console.log("Restaurants in Paris:", parisRestaurants.length);

  if (parisRestaurants[0]) {
    const id = parisRestaurants[0]._id.toString();
    const menu = await findMenuItemsByRestaurant(id);
    console.log("Menu items for first Paris restaurant:", menu.length);
  }

  await closeDb();
}

run().catch(console.error);
