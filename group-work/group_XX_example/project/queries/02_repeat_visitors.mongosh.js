// Lists customers with at least two visits plus their last event.
// Usage: mongosh queries/02_repeat_visitors.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Repeat visitor leaderboard (>= 2 visits):");
db.orders
  .aggregate([
    // Aggregate by customer to capture visit counts and last attendance.
    {
      $group: {
        _id: "$customer.customerId",
        name: { $first: "$customer.name" },
        district: { $first: "$customer.district" },
        visits: { $sum: 1 },
        events: { $addToSet: "$eventCode" },
        lastVisit: { $max: "$createdAt" },
      },
    },
    // Only keep loyal visitors (2+ orders).
    { $match: { visits: { $gte: 2 } } },
    // Show recent/high-volume customers at the top.
    { $sort: { visits: -1, lastVisit: -1 } },
  ])
  .forEach((doc) => printjson(doc));
