/* eslint-disable no-undef */
// Lists users with the most reservations.
// Usage: mongosh queries/16_users_with_most_reservations.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Users with the most reservations:");

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
      $addFields: {
        reservationsCount: { $size: "$reservations" }
      }
    },
    {
      $project: {
        _id: 0,
        name: 1,
        email: 1,
        reservationsCount: 1
      }
    },
    {
      $sort: { reservationsCount: -1 }
    },
    { $limit: 10 }
  ])
  .forEach((doc) => printjson(doc));
