// Query 14: Average Stay Length
// Query name: Average Stay Length
// Query question: What is the average number of nights per booking?
// Business purpose: understand typical booking duration for pricing and cleaning scheduling

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Average Stay Length (nights) ===\n");

db.bookings
  .aggregate([
    { $match: { nights: { $exists: true } } },
    { $group: { _id: null, avg_stay_length_nights: { $avg: "$nights" }, bookings: { $sum: 1 } } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
