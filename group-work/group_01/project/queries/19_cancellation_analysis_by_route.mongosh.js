/* eslint-disable no-undef */
// Analyzes cancellation rates and potential revenue loss by route
// Usage: mongosh queries/19_cancellation_analysis_by_route.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Cancellation analysis by route:");

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
      $group: {
        _id: {
          departureAirportIdent: "$departureAirportIdent",
          arrivalAirportIdent: "$arrivalAirportIdent"
        },
        totalReservations: { $sum: 1 },
        cancelledReservations: {
          $sum: {
            $cond: [{ $eq: ["$reservations.status", "cancelled"] }, 1, 0]
          }
        },
        potentialRevenueLoss: {
          $sum: {
            $cond: [{ $eq: ["$reservations.status", "cancelled"] }, "$price", 0]
          }
        }
      }
    },
    {
      $addFields: {
        cancellationRate: {
          $cond: {
            if: { $gt: ["$totalReservations", 0] },
            then: {
              $multiply: [
                { $divide: ["$cancelledReservations", "$totalReservations"] },
                100
              ]
            },
            else: 0
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        route: {
          departureAirportIdent: "$_id.departureAirportIdent",
          arrivalAirportIdent: "$_id.arrivalAirportIdent"
        },
        totalReservations: 1,
        cancelledReservations: 1,
        cancellationRate: 1,
        potentialRevenueLoss: 1
      }
    },
    {
      $sort: { cancellationRate: -1, potentialRevenueLoss: -1 }
    },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));
