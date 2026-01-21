// Lab 04 - Solutions runner (mongosh-compatible)
// Run via: mongosh labs/lab04_aggregation/solutions.js

db = db.getSiblingDB("lab04_sales");

print("\n=== Import dataset ===");
load("import_data.js");

print("\n=== Aggregation tests ===");
load("test_lab04.js");

print("\nLab 04 solutions executed successfully.");
