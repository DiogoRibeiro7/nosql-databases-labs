/* eslint-disable no-undef */
// Creates a new flight reservation.
// Usage: mongosh queries/01_create_flight_reservation.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Creating flight reservation...");
const result = db.reservations.insertOne({
  flightId: "123",
  userId: "456",
  reservationDate: new Date(),
  status: "pending"
});
printjson(result);
