/* eslint-disable no-undef */
// Finds flights with low occupancy.
// Usage: mongosh queries/17_flights_with_low_occupancy.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Flights with low occupancy:");

const occupancyThreshold = 0.3; // 30% occupancy threshold

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
      $addFields: {
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
      $addFields: {
        occupancyRate: {
          $cond: {
            if: { $gt: ["$maxCapacity", 0] },
            then: { $divide: ["$activeReservations", "$maxCapacity"] },
            else: 0
          }
        }
      }
    },
    {
      $match: {
        status: "scheduled",
        occupancyRate: { $lt: occupancyThreshold },
        maxCapacity: { $gt: 0 }
      }
    },
    {
      $project: {
        _id: 0,
        flightNumber: 1,
        departureAirportIdent: 1,
        arrivalAirportIdent: 1,
        departureTime: 1,
        maxCapacity: 1,
        activeReservations: 1,
        occupancyRate: 1
      }
    },
    {
      $sort: { occupancyRate: 1 }
    },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));
