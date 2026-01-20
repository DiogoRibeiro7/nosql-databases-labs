// find() + sort example: pull the most recent high-value baskets to review customer experience notes.
// Usage: mongosh queries/07_recent_high_value_orders.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Recent orders >= €15 (showing event, vendor, payment, and feedback):");
db.orders
  // Basic predicate on totalAmount shows how to combine comparisons with projections.
  .find(
    { totalAmount: { $gte: 15 } },
    { _id: 0, orderCode: 1, eventCode: 1, vendorId: 1, totalAmount: 1, paymentMethod: 1, feedbackScore: 1, createdAt: 1 }
  )
  // Sort newest first to help with incident review.
  .sort({ createdAt: -1 })
  // Keep the output manageable for demos.
  .limit(10)
  .forEach((doc) => printjson(doc));
