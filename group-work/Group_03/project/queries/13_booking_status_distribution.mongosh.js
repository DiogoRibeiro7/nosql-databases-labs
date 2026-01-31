// Query 13: Booking Status Distribution
// Query name: Booking Status Distribution
// Query question: What is the distribution of booking statuses (confirmed/cancelled/etc.)?
// Business purpose: monitor cancellations vs confirmations to detect issues

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Booking Status Distribution ===\n");

db.bookings
  .aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }, { $sort: { total: -1 } }])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
