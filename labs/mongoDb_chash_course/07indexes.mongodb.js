/* global db, use, print, printjson */
use("EcommerceCrashCourse");

const section = (title) => {
  print("");
  print(`=== ${title} ===`);
};

section("Existing indexes");
printjson(db.products.getIndexes());

section("Creating high-value indexes");
const nameIndex = db.products.createIndex({ name: 1 }, { name: "product_name_idx" });
print(`Created: ${nameIndex}`);

const catalogIndex = db.products.createIndex(
  { category: 1, price: -1 },
  { name: "category_price_idx" },
);
print(`Created: ${catalogIndex}`);

const textIndex = db.products.createIndex(
  { description: "text", tags: "text" },
  { name: "product_text_idx" },
);
print(`Created: ${textIndex}`);

section("Explain plan using the compound index");
const explainPlan = db.products
  .find({ category: "accessories" })
  .sort({ price: -1 })
  .explain("executionStats");
printjson(explainPlan.queryPlanner.winningPlan);
