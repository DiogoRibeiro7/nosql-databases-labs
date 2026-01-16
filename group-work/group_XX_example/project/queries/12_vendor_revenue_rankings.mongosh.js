// Aggregation example: event-adjusted revenue ranking with cumulative totals.
// Usage: mongosh queries/12_vendor_revenue_rankings.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Revenue leaderboard by vendor:");
db.orders
  .aggregate([
    // Sum revenue and event coverage per vendor.
    {
      $group: {
        _id: "$vendorId",
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
        eventsServed: { $addToSet: "$eventCode" },
      },
    },
    // Order vendors by raw revenue before computing cumulative totals.
    { $sort: { revenue: -1 } },
    // Use a window to show how overall revenue accumulates as we walk the ranking.
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
    // Format the output for display.
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
