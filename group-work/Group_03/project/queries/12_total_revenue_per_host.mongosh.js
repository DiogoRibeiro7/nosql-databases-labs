// Query 12: Revenue per Host
// Query name: Revenue per Host
// Query question: How much revenue does each host generate (confirmed bookings)?
// Business purpose: identify top-earning hosts for revenue share and incentives

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Revenue per Host ===\n");

db.bookings
  .aggregate([
    { $match: { status: "confirmed" } },
    {
      $group: { _id: "$host_id", total_revenue: { $sum: "$total_revenue" }, bookings: { $sum: 1 } },
    },
    { $sort: { total_revenue: -1 } },
    { $limit: 20 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
