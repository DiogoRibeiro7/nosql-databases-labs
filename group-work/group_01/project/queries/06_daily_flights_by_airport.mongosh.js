/* eslint-disable no-undef */
// Lists daily flights by airport for today.
// Usage: mongosh queries/06_daily_flights_by_airport.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Daily flights by airport for today:");

// Get start and end of today
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Specific airport to filter
const airportIdent = "NWWM";

db.flights.aggregate([
  {
    $match: {
      $or: [
        {
          departureAirportIdent: airportIdent,
          departureTime: {
            $gte: today,
            $lt: tomorrow
          },
        },
        {
          arrivalAirportIdent: airportIdent,
          arrivalTime: {
            $gte: today,
            $lt: tomorrow
          },
        }
      ],
      status: { $ne: "cancelled" }
    },
  },
]).forEach((doc) => printjson(doc));
