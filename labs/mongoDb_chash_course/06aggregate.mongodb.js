/* global db, use */
use("EcommerceCrashCourse");

const section = (title) => {
  print("");
  print(`=== ${title} ===`);
};

const printCursor = (cursor) => cursor.forEach((doc) => printjson(doc));

// 1) Revenue by customer.
section("Revenue by customer");
printCursor(
  db.orders.aggregate([
    {
      $group: {
        _id: "$customer",
        orders: { $sum: 1 },
        totalSpent: { $sum: "$total" },
        lastOrder: { $max: "$createdAt" },
      },
    },
    { $sort: { totalSpent: -1 } },
  ])
);

// 2) Revenue by category: unwind items, then group.
section("Revenue by category");
printCursor(
  db.orders.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.category",
        unitsSold: { $sum: "$items.quantity" },
        categoryRevenue: { $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } },
      },
    },
    { $sort: { categoryRevenue: -1 } },
  ])
);

// 3) Example pipeline showing $match and $project.
section("Low-stock inventory with computed totals");
printCursor(
  db.products.aggregate([
    { $match: { stock: { $lt: 100 } } },
    {
      $project: {
        _id: 0,
        name: 1,
        stock: 1,
        price: 1,
        inventoryValue: { $round: [{ $multiply: ["$stock", "$price"] }, 2] },
      },
    },
  ])
);
