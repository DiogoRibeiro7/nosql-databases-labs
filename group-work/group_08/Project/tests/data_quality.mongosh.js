// Lightweight checks to keep the dataset consistent.
// Run with: mongosh tests/data_quality.mongosh.js

db = db.getSiblingDB("group_08_school_final");
const expectations = [
  // Ensure seed counts match the script after every import.
  { label: "grades", collection: "grades", query: {}, expected: 13 },
  { label: "students", collection: "students", query: {}, expected: 10 },
  { label: "subjects", collection: "subjects", query: {}, expected: 10 },
  // Cross-check that every grade references an existing subject.
  {
    label: "referential integrity",
    validator: () => db.grades.countDocuments({ subjectCode: { $nin: db.subjects.distinct("subjectCode") } }),
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
