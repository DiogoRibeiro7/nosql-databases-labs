// Aggregation example: event-adjusted revenue ranking with cumulative totals.
// Usage: mongosh queries/12_vendor_revenue_rankings.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Revenue leaderboard by vendor:");
db.orders
  .aggregate([
    {
      $group: {
        _id: "$vendorId",
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
        eventsServed: { $addToSet: "$eventCode" },
      },
    },
    { $sort: { revenue: -1 } },
    {
      $setWindowFields: {
        sortBy: { revenue: -1 },
        output: {
          cumulativeRevenue: {
            $sum: "$revenue",
            window: { documents: ["unbounded", "current"] },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        vendorId: "$_id",
        revenue: 1,
        orders: 1,
        eventsServed: { $size: "$eventsServed" },
        cumulativeRevenue: 1,
      },
    },
  ])
  .forEach((doc) => printjson(doc));
