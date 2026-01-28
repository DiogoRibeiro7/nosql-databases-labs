// Query 17: Hosts with Most Listings
// Query name: Hosts with Most Listings
// Query question: Which hosts manage the most listings?
// Business purpose: find large hosts for partnership and policy monitoring

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Hosts with Most Listings ===\n");

db.listings
  .aggregate([
    {
      $group: { _id: "$host.id", hostName: { $first: "$host.name" }, total_listings: { $sum: 1 } },
    },
    { $sort: { total_listings: -1 } },
    { $limit: 20 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
