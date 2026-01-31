// Query 21: Revenue Over Time
// Query name: Revenue Over Time
// Query question: How does revenue evolve month-over-month?
// Business purpose: visualize revenue trends to inform marketing and forecasting

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Revenue Over Time (monthly) ===\n");
db.bookings
  .aggregate([
    { $match: { status: "confirmed" } },
    {
      $project: {
        yearMonth: { $dateToString: { format: "%Y-%m", date: "$booking_date" } },
        total_revenue: 1,
      },
    },
    {
      $group: {
        _id: "$yearMonth",
        total_revenue: { $sum: "$total_revenue" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
