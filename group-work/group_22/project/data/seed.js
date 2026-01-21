const { getDb, closeDb } = require("../src/db");

async function main() {
  const db = await getDb();

  const restaurantsCol = db.collection("restaurants");
  const ordersCol = db.collection("orders");
  const menuItemsCol = db.collection("menu_items");
  const orderItemsCol = db.collection("order_items");

  // Make seed repeatable
  await menuItemsCol.deleteMany({});
  await orderItemsCol.deleteMany({});

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
    `Generated ${menuDocs.length} menu_items and ${orderItemDocs.length} order_items`
  );

  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
