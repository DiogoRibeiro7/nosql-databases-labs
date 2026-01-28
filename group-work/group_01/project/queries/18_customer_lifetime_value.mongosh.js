/* eslint-disable no-undef */
// Analyzes customer lifetime value and spending patterns
// Usage: mongosh queries/18_customer_lifetime_value.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Customer lifetime value analysis:");

db.users
  .aggregate([
    {
      $lookup: {
        from: "reservations",
        localField: "_id",
        foreignField: "userId",
        as: "reservations"
      }
    },
    {
      $unwind: {
        path: "$reservations",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        "reservations.status": "confirmed"
      }
    },
    {
      $lookup: {
        from: "flights",
        localField: "reservations.flightNumber",
        foreignField: "flightNumber",
        as: "flight"
      }
    },
    {
      $unwind: {
        path: "$flight",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        fullName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$firstName", ""] },
                " ",
                { $ifNull: ["$lastName", ""] }
              ]
            }
          }
        }
      }
    },
    {
      $group: {
        _id: "$_id",
        fullName: { $first: "$fullName" },
        email: { $first: "$email" },
        totalSpending: { $sum: "$flight.price" },
        reservationCount: { $sum: 1 }
      }
    },
    {
      $addFields: {
        averageSpendingPerReservation: {
          $cond: {
            if: { $gt: ["$reservationCount", 0] },
            then: { $divide: ["$totalSpending", "$reservationCount"] },
            else: 0
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        fullName: 1,
        email: 1,
        totalSpending: 1,
        reservationCount: 1,
        averageSpendingPerReservation: 1
      }
    },
    {
      $sort: { totalSpending: -1 }
    },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));
