// Query 04: Top Hosts by Number of Listings
// Identifies professional hosts and property managers
// Usage : mongosh queries/04_top_hosts_by_listings.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Top 10 Hosts by Number of Listings ===\n");

db.hosts
  .find(
    {},
    {
      _id: 0,
      host_id: 1,
      host_name: 1,
      listings_count: 1,
      total_capacity: 1,
      neighbourhoods: 1,
      avg_price: 1
    }
  )
  .sort({ listings_count: -1 })
  .limit(10)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
