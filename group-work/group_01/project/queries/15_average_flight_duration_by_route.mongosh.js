/* eslint-disable no-undef */
// Calculates average flight duration by route.
// Usage: mongosh queries/15_average_flight_duration_by_route.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Average flight duration by route:");

db.flights.aggregate([
  {
    $match: {
      departureTime: { $exists: true },
      arrivalTime: { $exists: true }
    }
  },
  {
    $addFields: {
      durationMinutes: {
        $divide: [
          { $subtract: ["$arrivalTime", "$departureTime"] },
          60000
        ]
      }
    }
  },
  {
    $group: {
      _id: {
        departureAirportIdent: "$departureAirportIdent",
        arrivalAirportIdent: "$arrivalAirportIdent"
      },
      averageDurationMinutes: { $avg: "$durationMinutes" }
    }
  },
  {
    $sort: { averageDurationMinutes: 1 }
  }
])
.forEach((doc) => printjson(doc));
