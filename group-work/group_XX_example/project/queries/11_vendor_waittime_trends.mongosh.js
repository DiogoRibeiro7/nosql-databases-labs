// Aggregation example: average wait time per vendor across all events.
// Usage: mongosh queries/11_vendor_waittime_trends.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Average wait time per vendor:");
db.orders
  .aggregate([
    // Calculate wait-time stats per vendor across all orders.
    {
      $group: {
        _id: "$vendorId",
        avgWait: { $avg: "$waitTimeMinutes" },
        minWait: { $min: "$waitTimeMinutes" },
        maxWait: { $max: "$waitTimeMinutes" },
        sampleOrders: { $push: "$orderCode" },
      },
    },
    // Join against the vendors collection to display friendly names.
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "vendorId",
        as: "vendor",
      },
    },
    { $unwind: "$vendor" },
    // Select the fields we care about and trim sample order codes.
    {
      $project: {
        _id: 0,
        vendorId: "$_id",
        name: "$vendor.name",
        avgWait: { $round: ["$avgWait", 1] },
        minWait: 1,
        maxWait: 1,
        sampleOrders: { $slice: ["$sampleOrders", 3] },
      },
    },
    // Surface the most efficient vendors first.
    { $sort: { avgWait: 1 } },
  ])
  .forEach((doc) => printjson(doc));
