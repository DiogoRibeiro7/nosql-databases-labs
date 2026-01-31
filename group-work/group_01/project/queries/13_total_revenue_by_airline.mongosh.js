/* eslint-disable no-undef */
// Calculates total revenue by airline.
// Uses reservation.amount when present (supports fare-class / per-reservation pricing);
// otherwise falls back to flight.price so existing data without amount still works.
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
        totalRevenue: {
          $sum: { $ifNull: ["$reservations.amount", "$price"] }
        }
      }
    }
  ])
  .forEach((doc) => printjson(doc));
