const { ObjectId } = require("mongodb");
const { getDb } = require("./db");

// Insert one menu item
async function createMenuItem(menuItem) {
  const db = await getDb();
  const result = await db.collection("menu_items").insertOne(menuItem);
  return result.insertedId;
}

// Find many menu items by restaurant and optional category 
async function findMenuItemsByRestaurant(restaurantId, category) {
  const db = await getDb();
  const filter = { restaurantId: new ObjectId(restaurantId) };

  if (category) {
    filter.category = category;
  }

  return db.collection("menu_items").find(filter).toArray();
}

// Update one menu item's price
async function updateMenuItemPrice(id, newPrice) {
  const db = await getDb();
  return db.collection("menu_items").updateOne(
    { _id: new ObjectId(id) },
    { $set: { price: newPrice } }
  );
}

// Delete many menu items by restaurant
async function deleteMenuItemsByRestaurant(restaurantId) {
  const db = await getDb();
  return db.collection("menu_items").deleteMany({
    restaurantId: new ObjectId(restaurantId),
  });
}

module.exports = {
  createMenuItem,
  findMenuItemsByRestaurant,
  updateMenuItemPrice,
  deleteMenuItemsByRestaurant,
};
