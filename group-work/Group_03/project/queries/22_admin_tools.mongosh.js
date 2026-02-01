// Query 22: Admin Tools
// Query name: Admin Tools
// Query question: What quick health and DB-level stats are available?
// Business purpose: provide fast operational checks and top-level counts

db = db.getSiblingDB("group_03_airbnb");
print("=== ADMIN TOOLS ===");

// Database-level info
print("-- DB stats --");
printjson(db.stats());

// Collection counts
print("-- Collection counts --");
print(`listings: ${db.listings.countDocuments()}`);
print(`bookings: ${db.bookings.countDocuments()}`);

// Quick health check: list top 5 hosts by listings
print("-- Top hosts by listing count --");
db.listings
  .aggregate([
    {
      $group: { _id: "$host.id", hostName: { $first: "$host.name" }, total_listings: { $sum: 1 } },
    },
    { $sort: { total_listings: -1 } },
    { $limit: 5 },
  ])
  .forEach((d) => printjson(d));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
