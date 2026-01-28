// Query 07: Average Price by Room Type
// Query name: Average Price by Room Type
// Query question: What is the average price per room type?
// Business purpose: understand pricing differences across product types

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Average Price by Room Type ===\n");

db.listings
  .aggregate([
    {
      $group: {
        _id: "$details.room_type",
        avg_price: { $avg: "$pricing.daily_price" },
        count: { $sum: 1 },
      },
    },
    { $sort: { avg_price: -1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
