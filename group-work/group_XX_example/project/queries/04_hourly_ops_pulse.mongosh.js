// Tracks hourly order volume and wait time for the flagship event.
// Usage: mongosh queries/04_hourly_ops_pulse.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Hourly operations pulse for EVT-PRT-STREET-001:");
db.orders
  .aggregate([
    // Focus the report on the flagship event only.
    { $match: { eventCode: "EVT-PRT-STREET-001" } },
    // Bucket orders by hour and vendor to spot service peaks.
    {
      $group: {
        _id: {
          hour: {
            $dateTrunc: { date: "$createdAt", unit: "hour", timezone: "UTC" },
          },
          vendor: "$vendorId",
        },
        orders: { $sum: 1 },
        avgWait: { $avg: "$waitTimeMinutes" },
      },
    },
    // Display the timeline chronologically while keeping more active vendors first per hour.
    { $sort: { "_id.hour": 1, orders: -1 } },
  ])
  .forEach((doc) => printjson(doc));
