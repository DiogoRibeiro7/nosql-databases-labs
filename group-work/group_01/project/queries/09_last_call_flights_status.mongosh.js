/* eslint-disable no-undef */
// Shows status of last call flights by airport
// last call are flights that are scheduled to depart in the next 30 minutes
// Usage: mongosh queries/09_last_call_flights_status.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Last call flights status by airport:");

// Get now and 30 minutes from now
const now = new Date();
const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

// Specific airport to filter
const airportIdent = "NWWM";

db.flights.aggregate([
  {
    $match: {
      departureAirportIdent: airportIdent,
      departureTime: {
        $gte: now,
        $lt: thirtyMinutesFromNow
      },
      status: { $ne: "cancelled" }
    },
  },
]).forEach((doc) => printjson(doc));
