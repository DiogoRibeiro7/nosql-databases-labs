// Query 03: Average Price per Neighbourhood
// Query name: Average Price per Neighbourhood
// Query question: What is the average daily price per neighbourhood?
// Business purpose: inform area-specific pricing and yield management

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Average Price per Neighbourhood ===\n");

db.listings
  .aggregate([
    {
      $group: {
        _id: "$location.neighbourhood",
        avg_price: { $avg: "$pricing.daily_price" },
        total_listings: { $sum: 1 },
      },
    },
    { $sort: { avg_price: -1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
