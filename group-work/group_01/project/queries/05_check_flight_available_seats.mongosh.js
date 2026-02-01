/* eslint-disable no-undef */
// Checks available seats for a specific flight.
// Usage: mongosh queries/05_check_flight_available_seats.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Checking flight available seats:");
db.flights
  .aggregate([
    {
      $match: { flightNumber: "VD9531" }
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
      $project: {
        _id: 0,
        flightNumber: 1,
        maxCapacity: 1,
        activeReservations: {
          $size: {
            $filter: {
              input: "$reservations",
              as: "reservation",
              cond: { $eq: ["$$reservation.status", "confirmed"] }
            }
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        flightNumber: 1,
        maxCapacity: 1,
        activeReservations: 1,
        availableSeats: {
          $subtract: ["$maxCapacity", "$activeReservations"]
        }
      }
    }
  ]).forEach((doc) => printjson(doc));
