// Approximate Metrics Demo
// Usage: mongosh advanced/approximate_metrics.mongosh.js

db = db.getSiblingDB("group_xx_example_final");

print("Generating quick summary metrics using $facet and $bucketAuto...");

db.orders
  .aggregate([
    {
      $facet: {
        revenueByVendor: [
          { $group: { _id: "$vendorId", revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
          { $sort: { revenue: -1 } },
          { $limit: 3 },
        ],
        waitTimeBuckets: [
          { $bucketAuto: { groupBy: "$waitTimeMinutes", buckets: 3 } },
          { $project: { _id: 0, minWait: "$_id.min", maxWait: "$_id.max", orders: "$count" } },
        ],
        paymentMix: [
          { $group: { _id: "$paymentMethod", orders: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
          { $sort: { orders: -1 } },
        ],
      },
    },
  ])
  .forEach((doc) => {
    print("\nTop vendors by revenue:");
    doc.revenueByVendor.forEach((entry) => printjson(entry));

    print("\nWait time buckets:");
    doc.waitTimeBuckets.forEach((bucket) => printjson(bucket));

    print("\nPayment mix:");
    doc.paymentMix.forEach((mix) => printjson(mix));
  });
