// Query 19: Capacity Analysis by Neighbourhood
// Identifies accommodation capacity distribution for tourism planning
// Usage: mongosh queries/19_capacity_by_neighbourhood.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Accommodation Capacity Analysis by Neighbourhood ===\n");

db.listings
  .aggregate([
    // Group by neighbourhood
    {
      $group: {
        _id: "$location.neighbourhood",
        total_listings: { $sum: 1 },
        total_beds: { $sum: "$capacity.beds" },
        total_accommodates: { $sum: "$capacity.accommodates" },
        avg_beds_per_listing: { $avg: "$capacity.beds" },
        avg_accommodates: { $avg: "$capacity.accommodates" },
        max_capacity_listing: { $max: "$capacity.accommodates" },
        listings_with_multiple_bedrooms: {
          $sum: { $cond: [{ $gte: ["$capacity.bedrooms", 2] }, 1, 0] },
        },
      },
    },
    // Add percentage calculations
    {
      $project: {
        neighbourhood: "$_id",
        total_listings: 1,
        total_beds: 1,
        total_accommodates: 1,
        avg_beds_per_listing: { $round: ["$avg_beds_per_listing", 2] },
        avg_accommodates: { $round: ["$avg_accommodates", 2] },
        max_capacity_listing: 1,
        listings_with_multiple_bedrooms: 1,
        capacity_per_listing: {
          $round: [{ $divide: ["$total_accommodates", "$total_listings"] }, 2],
        },
      },
    },
    // Sort by total capacity
    { $sort: { total_accommodates: -1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
