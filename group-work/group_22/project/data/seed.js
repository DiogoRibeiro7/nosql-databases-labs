const { getDb, closeDb } = require("../src/db");
const fs = require("fs");
const path = require("path");
const { EJSON } = require("bson");

async function main() {
  const db = await getDb();

  const restaurantsCol = db.collection("restaurants");
  const ordersCol = db.collection("orders");
  const menuItemsCol = db.collection("menu_items");
  const orderItemsCol = db.collection("order_items");

  // Make seed repeatable (clear derived collections first)
  await menuItemsCol.deleteMany({});
  await orderItemsCol.deleteMany({});

  // Load base data files and populate `restaurants` and `orders` collections
  const dataRoot = path.resolve(__dirname, "../../../..", "data", "food_express");
  const restaurantsFile = path.join(dataRoot, "foodexpress_db.restaurants.json");
  const ordersFile = path.join(dataRoot, "foodexpress_db.orders.json");

  async function loadAndInsertJson(filePath, collection, name) {
    if (!fs.existsSync(filePath)) {
      console.log(`${name} file not found at ${filePath} — skipping`);
      return 0;
    }
    const text = fs.readFileSync(filePath, "utf8");
    const docs = EJSON.parse(text);
    if (!Array.isArray(docs)) {
      throw new Error(`${name} file did not contain an array`);
    }
    if (docs.length === 0) {
      console.log(`No docs in ${name} file — skipping`);
      return 0;
    }
    await collection.deleteMany({});
    await collection.insertMany(docs);
    console.log(`Inserted ${docs.length} ${name}`);
    return docs.length;
  }

  const insertedRestaurants = await loadAndInsertJson(restaurantsFile, restaurantsCol, "restaurants");
  const insertedOrders = await loadAndInsertJson(ordersFile, ordersCol, "orders");

  // 1) Build menu_items from restaurants.menu
  const restaurants = await restaurantsCol.find({}).toArray();
  const menuDocs = [];

  for (const r of restaurants) {
    if (!Array.isArray(r.menu)) continue;
    for (const m of r.menu) {
      menuDocs.push({
        restaurantId: r._id,
        item: m.item,
        price: m.price,
        category: m.category,
      });
    }
  }

  if (menuDocs.length) {
    await menuItemsCol.insertMany(menuDocs);
  }

  // 2) Build order_items from orders.items
  const orders = await ordersCol.find({}).toArray();
  const orderItemDocs = [];

  for (const o of orders) {
    if (!Array.isArray(o.items)) continue;
    for (const it of o.items) {
      orderItemDocs.push({
        orderId: o._id,
        name: it.name,
        qty: it.qty,
        unitPrice: it.unitPrice,
      });
    }
  }

  if (orderItemDocs.length) {
    await orderItemsCol.insertMany(orderItemDocs);
  }

  console.log(
    `Inserted ${insertedRestaurants} restaurants, ${insertedOrders} orders, generated ${menuDocs.length} menu_items and ${orderItemDocs.length} order_items`
  );

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
