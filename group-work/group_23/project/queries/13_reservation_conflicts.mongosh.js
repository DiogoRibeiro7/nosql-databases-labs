// Availability conflict check for a listing within a date range.
// Usage: mongosh queries/13_reservation_conflicts.mongosh.js

db = db.getSiblingDB("staybook");
print("Reservation conflicts for listingId=10000 (sample range):");

db.reservations
  .find(
    {
      listingId: 10000,
      status: { $in: ["confirmed", "completed"] },
      dateFrom: { $lt: ISODate("2026-02-12T00:00:00Z") },
      dateTo: { $gt: ISODate("2026-02-10T00:00:00Z") },
    },
    { _id: 0, listingId: 1, guestId: 1, status: 1, dateFrom: 1, dateTo: 1, totalPrice: 1 }
  )
  .forEach((doc) => printjson(doc));
