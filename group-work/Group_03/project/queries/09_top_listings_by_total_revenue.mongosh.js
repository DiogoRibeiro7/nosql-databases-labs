// Query 09: Revenue by Listing
// Query name: Top Listings by Total Revenue
// Query question: Which listings generate the most revenue?
// Business purpose: identify top-performing listings by revenue

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Top Listings by Total Revenue ===\n");

db.bookings
  .aggregate([
    { $match: { status: "confirmed" } },
    {
      $group: {
        _id: "$listing_id",
        total_revenue: { $sum: "$total_price" },
        total_bookings: { $sum: 1 },
      },
    },
    { $sort: { total_revenue: -1 } },
    { $limit: 10 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
