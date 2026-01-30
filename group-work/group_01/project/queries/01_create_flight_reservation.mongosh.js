/* eslint-disable no-undef */
// Creates a new flight reservation.
// Usage: mongosh queries/01_create_flight_reservation.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Creating flight reservation...");
const result = db.reservations.insertOne({
  flightNumber: "VD9531",
  userId: ObjectId("697102e5d31ee2696f40e8d9"),
  reservationDate: new Date(),
  status: "pending"
});
printjson(result);
