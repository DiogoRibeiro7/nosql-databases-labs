/* eslint-disable no-undef */
// Lists all airlines operating at a specific airport.
// Usage: mongosh queries/10_airlines_operating_at_airport.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Airlines operating at airport:");

// Specific airport to filter
const airportIdent = "NWWM";

db.flights.aggregate([
  {
    $match: {
      $or: [
        { departureAirportIdent: airportIdent },
        { arrivalAirportIdent: airportIdent }
      ]
    }
  },
  {
    $group: {
      _id: "$airlineIata",
      flightsCount: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "airlines",
      localField: "_id",
      foreignField: "iata",
      as: "airline"
    }
  },
  {
    $unwind: "$airline"
  },
  {
    $project: {
      _id: 0,
      name: "$airline.name",
      iata: "$airline.iata",
      flightsCount: 1
    }
  },
  { $sort: { flightsCount: -1 } }
]).forEach((doc) => printjson(doc));
