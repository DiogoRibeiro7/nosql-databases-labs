/* global db, use, print, printjson */
use("EcommerceCrashCourse");

const section = (title) => {
  print("");
  print(`=== ${title} ===`);
};

// 1) Find products that have healthy stock levels.
section("Healthy stock levels (> 50 units)");
db.products
  .find({ stock: { $gt: 50 } }, { name: 1, stock: 1, price: 1, _id: 0 })
  .limit(5)
  .forEach((doc) => printjson(doc));

// 2) Filter by category and include only selected fields.
section("Accessory catalog (sorted by price)");
db.products
  .find({ category: "accessories" }, { name: 1, price: 1, rating: 1, _id: 0 })
  .sort({ price: 1 })
  .forEach((doc) => printjson(doc));

// 3) Paginate results (page = 2, pageSize = 2).
const page = 2;
const pageSize = 2;
section(`Page ${page} (pageSize ${pageSize})`);
db.products
  .find({}, { name: 1, price: 1, _id: 0 })
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .forEach((doc) => printjson(doc));

// 4) Use projection to exclude heavy fields.
section("Wireless tagged items (projection excludes description)");
db.products
  .find({ tags: "wireless" }, { description: 0 })
  .limit(3)
  .forEach((doc) => printjson(doc));
