// Query 19: Average Price per Host
// Query name: Average Price per Host
// Query question: What is the average listing price per host?
// Business purpose: detect hosts with premium portfolios for targeting and auditing

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Average Price per Host ===\n");

db.listings
  .aggregate([
    {
      $group: {
        _id: "$host.id",
        hostName: { $first: "$host.name" },
        avg_price: { $avg: "$pricing.daily_price" },
        listings: { $sum: 1 },
      },
    },
    { $sort: { avg_price: -1 } },
    { $limit: 20 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
