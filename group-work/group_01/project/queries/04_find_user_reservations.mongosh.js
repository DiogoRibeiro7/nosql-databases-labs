/* eslint-disable no-undef */
// Finds all reservations for a specific user.
// Usage: mongosh queries/04_find_user_reservations.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Finding user reservations:");
db.reservations
  .find({ userId: ObjectId("697102e5d31ee2696f40e8d9") })
  .forEach((doc) => printjson(doc));
