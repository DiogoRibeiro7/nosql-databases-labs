// Aggregation example: payment method mix by event to plan POS terminals.
// Usage: mongosh queries/09_payment_mix_by_event.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Payment mix per event:");
db.orders
  .aggregate([
    // First level: count revenue/orders per event × payment method pair.
    {
      $group: {
        _id: { eventCode: "$eventCode", paymentMethod: "$paymentMethod" },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    // Second level: reshape so each event has an array of payment mix entries.
    {
      $group: {
        _id: "$_id.eventCode",
        mix: {
          $push: {
            method: "$_id.paymentMethod",
            orders: "$orders",
            revenue: "$revenue",
          },
        },
        totalOrders: { $sum: "$orders" },
      },
    },
    // Show busiest events first.
    { $sort: { totalOrders: -1 } },
  ])
  .forEach((doc) => printjson(doc));
