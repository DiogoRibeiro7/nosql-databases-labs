/* eslint-disable no-undef */
// Finds flights by route and date.
// Usage: mongosh queries/11_find_flights_by_route_and_date.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Flights by route and date:");

// Specific route to filter
const departureAirportIdent = "MBPV";
const arrivalAirportIdent = "NWWM";

// Get start and end of today
const today = new Date("2026-01-21");
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

db.flights.find({
  departureAirportIdent: departureAirportIdent,
  arrivalAirportIdent: arrivalAirportIdent,
  departureTime: {
    $gte: today,
    $lt: tomorrow
  },
  status: { $ne: "cancelled" }
}).forEach((doc) => printjson(doc));
