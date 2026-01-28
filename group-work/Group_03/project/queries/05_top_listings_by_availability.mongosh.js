// Query 05: Listings Availability Ranking
// Query name: Listings Availability Ranking
// Query question: Which listings have the most availability days per year?
// Business purpose: find most available inventory for last-minute promotions
db = db.getSiblingDB("group_03_airbnb");

print("\n=== Listings by Availability (365 days) ===\n");

db.listings
  .aggregate([
    {
      $project: {
        _id: 0,
        listing_id: "$_id",
        name: 1,
        availability: "$availability.days_available_365",
      },
    },
    { $sort: { availability: -1, name: 1 } },
    { $limit: 10 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
