// Query 06: Listings per Host
// Query name: Listings per Host
// Query question: How many listings does each host have?
// Business purpose: measure host concentration and identify power-users

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Listings per Host ===\n");

db.listings
  .aggregate([
    {
      $group: {
        _id: "$host.id",
        hostName: { $first: "$host.name" },
        total_listings: { $sum: 1 },
      },
    },
    { $sort: { total_listings: -1 } },
    { $limit: 20 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
