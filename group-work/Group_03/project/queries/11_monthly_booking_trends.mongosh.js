// Query 11: Monthly Booking Trends
// Query name: Monthly Booking Trends
// Query question: What are monthly booking counts and trends?
// Business purpose: detect seasonality and plan staffing/marketing

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Monthly Booking Trends ===\n");

db.bookings
  .aggregate([
    { $match: { status: "confirmed" } },
    {
      $project: {
        yearMonth: { $dateToString: { format: "%Y-%m", date: "$booking_date" } },
      },
    },
    { $group: { _id: "$yearMonth", total_bookings: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
