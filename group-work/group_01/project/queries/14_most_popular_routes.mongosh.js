/* eslint-disable no-undef */
// Finds the most popular flight routes.
// Usage: mongosh queries/14_most_popular_routes.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Most popular routes:");

db.flights
  .aggregate([
    {
      $lookup: {
        from: "reservations",
        localField: "flightNumber",
        foreignField: "flightNumber",
        as: "reservations"
      }
    },
    {
      $unwind: "$reservations"
    },
    {
      $match: {
        "reservations.status": "confirmed"
      }
    },
    {
      $group: {
        _id: {
          departureAirportIdent: "$departureAirportIdent",
          arrivalAirportIdent: "$arrivalAirportIdent"
        },
        reservationsCount: { $sum: 1 }
      }
    },
    {
      $sort: { reservationsCount: -1 }
    },
    { $limit: 10 }
  ])
  .forEach((doc) => printjson(doc));
