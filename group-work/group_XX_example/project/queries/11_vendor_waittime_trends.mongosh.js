// Aggregation example: average wait time per vendor across all events.
// Usage: mongosh queries/11_vendor_waittime_trends.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Average wait time per vendor:");
db.orders
  .aggregate([
    {
      $group: {
        _id: "$vendorId",
        avgWait: { $avg: "$waitTimeMinutes" },
        minWait: { $min: "$waitTimeMinutes" },
        maxWait: { $max: "$waitTimeMinutes" },
        sampleOrders: { $push: "$orderCode" },
      },
    },
    {
      $lookup: {
        from: "vendors",
        localField: "_id",
        foreignField: "vendorId",
        as: "vendor",
      },
    },
    { $unwind: "$vendor" },
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
    { $sort: { avgWait: 1 } },
  ])
  .forEach((doc) => printjson(doc));
