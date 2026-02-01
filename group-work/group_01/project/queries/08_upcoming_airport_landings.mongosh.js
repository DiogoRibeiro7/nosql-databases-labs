/* eslint-disable no-undef */
// Lists upcoming landings at a specific airport.
// Usage: mongosh queries/08_upcoming_airport_landings.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Upcoming airport landings:");
const now = new Date();
db.flights
  .find({ arrivalTime: { $gt: now } })
  .sort({ arrivalTime: 1 })
  .forEach((doc) => printjson(doc));
