// Lightweight checks to keep the dataset consistent.
// Run with: mongosh tests/data_quality.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
const expectations = [
  // Ensure seed counts match the script after every import.
  { label: "vendors", collection: "vendors", query: {}, expected: 6 },
  { label: "events", collection: "events", query: {}, expected: 5 },
  { label: "orders", collection: "orders", query: {}, expected: 20 },
  // Cross-check that every order references an existing event.
  {
    label: "referential integrity",
    validator: () => db.orders.countDocuments({ eventCode: { $nin: db.events.distinct("eventCode") } }),
    expected: 0,
  },
  // Guard against corrupt documents missing order items.
  {
    label: "orders with items",
    collection: "orders",
    query: { items: { $size: 0 } },
    expected: 0,
  },
];

let failures = 0;
expectations.forEach((check) => {
  let actual;
  if (check.validator) {
    // Some validations need computed values (e.g., comparing two collections).
    actual = check.validator();
  } else {
    actual = db.getCollection(check.collection).countDocuments(check.query);
  }

  const ok = actual === check.expected;
  print(`[${ok ? "OK" : "FAIL"}] ${check.label} -> expected ${check.expected}, got ${actual}`);
  if (!ok) failures += 1;
});

if (failures === 0) {
  print("All sanity checks passed.");
} else {
  throw new Error(`${failures} checks failed. Fix the dataset before committing.`);
}
