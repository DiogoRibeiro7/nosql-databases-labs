// Aggregation example: feedback score buckets per vendor.
// Usage: mongosh queries/10_feedback_distribution_by_vendor.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Feedback distribution per vendor:");
db.orders
  .aggregate([
    // Bucket feedback scores into ranges so staff can read quickly.
    {
      $bucket: {
        groupBy: "$feedbackScore",
        boundaries: [0, 3.5, 4.0, 4.5, 5.1],
        default: "out_of_range",
        output: {
          vendorId: { $addToSet: "$vendorId" },
          orders: { $sum: 1 },
        },
      },
    },
    { $unwind: "$vendorId" },
    // Re-aggregate per vendor per bucket.
    {
      $group: {
        _id: { vendorId: "$vendorId", bucket: "$_id" },
        orders: { $sum: "$orders" },
      },
    },
    // Final reshape: one document per vendor with the full bucket list.
    {
      $group: {
        _id: "$_id.vendorId",
        buckets: {
          $push: {
            scoreRange: "$_id.bucket",
            orders: "$orders",
          },
        },
        totalOrders: { $sum: "$orders" },
      },
    },
    // Larger datasets → highlight most-reviewed vendors first.
    { $sort: { totalOrders: -1 } },
  ])
  .forEach((doc) => printjson(doc));
