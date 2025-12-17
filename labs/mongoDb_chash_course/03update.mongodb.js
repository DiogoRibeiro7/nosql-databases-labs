/* global db, use */

use("EcommerceCrashCourse");

// Update one: tune pricing and stock for a single product.
const monitorUpdate = db.products.updateOne(
  { name: "4K Monitor" },
  {
    $set: { price: 339.0 },
    $inc: { stock: 5 },
  }
);
print("Updated 4K Monitor:");
printjson(monitorUpdate);

// Update many: add a "sale" tag to every accessory.
const accessoriesUpdate = db.products.updateMany(
  { category: "accessories" },
  {
    $addToSet: { tags: "sale" },
    $currentDate: { updatedAt: true },
  }
);
print("Accessories tagged for sale:");
printjson(accessoriesUpdate);

// Replace example (commented out): use when you want to overwrite the whole document.
// db.products.replaceOne(
//   { name: "USB-C Hub" },
//   {
//     name: "USB-C Hub",
//     description: "Updated description...",
//     price: 55,
//     category: "accessories",
//     tags: ["electronics"],
//     stock: 180,
//     rating: 4.2,
//     createdAt: new Date(),
//   }
// );
