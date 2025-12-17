// Lab 03 – Solutions runner (mongosh-compatible)
// Run via: mongosh labs/lab03_queries/solutions.js

db = db.getSiblingDB("lab03_movies");

print("\n=== Import dataset ===");
load("import_data_mongosh.js");

print("\n=== Data integrity tests ===");
load("test_lab03_mongosh.js");

print("\n=== Aggregation/Query examples ===");
load("queries_mongosh.js");

print("\nLab 03 solutions executed successfully.");
