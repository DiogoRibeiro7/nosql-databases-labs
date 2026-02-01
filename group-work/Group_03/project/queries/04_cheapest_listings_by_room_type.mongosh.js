// Query 04: Cheapest Listings by Room Type
// Query name: Cheapest Listings by Room Type
// Query question: What's the cheapest listing for each room type?
// Business purpose: identify low-cost inventory for budget travellers and promotions

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Cheapest Listings by Room Type ===\n");

db.listings
  .aggregate([
    { $sort: { "pricing.daily_price": 1 } },
    {
      $group: {
        _id: "$details.room_type",
        cheapest_price: { $first: "$pricing.daily_price" },
        listing_name: { $first: "$name" },
        listing_id: { $first: "$_id" },
      },
    },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
