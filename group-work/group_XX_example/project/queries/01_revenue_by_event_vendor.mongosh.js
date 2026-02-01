// Shows total revenue, order count, average wait time, and feedback per event/vendor pair.
// Usage: mongosh queries/01_revenue_by_event_vendor.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Revenue and service quality per event/vendor:");
db.orders
  .aggregate([
    // Group orders by event/vendor pair to compute KPIs.
    {
      $group: {
        _id: { eventCode: "$eventCode", vendorId: "$vendorId" },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
        avgWait: { $avg: "$waitTimeMinutes" },
        avgFeedback: { $avg: "$feedbackScore" },
      },
    },
    // Sort descending so the highest-earning combinations appear first.
    { $sort: { "revenue": -1 } },
  ])
  .forEach((doc) => printjson(doc));
