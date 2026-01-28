/* eslint-disable no-undef */
// Calculates total revenue by airline.
// Usage: mongosh queries/13_total_revenue_by_airline.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Total revenue by airline:");

const airlineIata = "UA";

db.flights
  .aggregate([
    {
      $match: {
        airlineIata: airlineIata
      }
    },
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
        _id: "$airlineIata",
        totalRevenue: { $sum: "$price" }
      }
    }
  ])
  .forEach((doc) => printjson(doc));
