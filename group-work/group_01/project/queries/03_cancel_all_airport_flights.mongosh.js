/* eslint-disable no-undef */
// Cancels all flights for a specific airport.
// Usage: mongosh queries/03_cancel_all_airport_flights.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Cancelling all flights for airport:");
const result = db.flights.updateMany(
  {
    $or: [
      { departureAirportIdent: "ZPPP" },
      { arrivalAirportIdent: "ZPPP" }
    ],
    status: "scheduled"
  },
  { $set: { status: "cancelled" } }
);
printjson(result);
