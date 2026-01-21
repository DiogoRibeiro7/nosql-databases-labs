/* eslint-disable no-undef */
// Finds the cheapest flights by route.
// Usage: mongosh queries/12_cheapest_flights_by_route.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Cheapest flights by route:");

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
})
  .sort({ price: 1 })
  .limit(5)
  .forEach((doc) => printjson(doc));
