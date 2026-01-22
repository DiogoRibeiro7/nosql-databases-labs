// Reservations collection setup (lightweight).
// Usage: mongosh queries/03_reservations_schema_seed.mongosh.js

db = db.getSiblingDB("staybook");
print("Ensuring reservations collection exists:");

// Create collection if missing (idempotent pattern)
const existing = db.getCollectionNames();
if (!existing.includes("reservations")) {
  db.createCollection("reservations");
  print("Created collection: reservations");
} else {
  print("Collection already exists: reservations");
}

print("03_reservations_schema_seed completed.");
