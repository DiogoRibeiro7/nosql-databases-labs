// Performance demo: reservation conflict check using indexes.
// Usage: mongosh advanced/02_reservation_conflict_explain.mongosh.js

db = db.getSiblingDB("staybook");
print("Performance test B: reservation conflict check (listingId + status + date ranges)");

const query = {
  listingId: 10000,
  status: { $in: ["confirmed", "completed"] },
  dateFrom: { $lt: ISODate("2026-02-12T00:00:00Z") },
  dateTo: { $gt: ISODate("2026-02-10T00:00:00Z") },
};

const projection = { _id: 0, listingId: 1, guestId: 1, status: 1, dateFrom: 1, dateTo: 1, totalPrice: 1 };

print("Explain BEFORE ensuring compound index:");
printjson(
  db.reservations
    .find(query, projection)
    .explain("executionStats")
    .executionStats
);

print("Creating compound index: { listingId: 1, status: 1, dateFrom: 1, dateTo: 1 }");
db.reservations.createIndex({ listingId: 1, status: 1, dateFrom: 1, dateTo: 1 });

print("Explain AFTER creating compound index:");
printjson(
  db.reservations
    .find(query, projection)
    .explain("executionStats")
    .executionStats
);

print("Done.");
