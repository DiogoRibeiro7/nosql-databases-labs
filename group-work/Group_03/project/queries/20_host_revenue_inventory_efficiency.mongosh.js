// Query 20: Host Revenue & Inventory Efficiency
// Query name: Host Revenue & Inventory Efficiency
// Query question: How efficient are hosts at converting inventory into revenue?
// Business purpose: evaluate host performance across inventory and revenue

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Host Revenue & Inventory Efficiency ===\n");

db.bookings
  .aggregate([
    {
      $group: {
        _id: "$host_id",
        total_bookings: { $sum: 1 },
        total_revenue: { $sum: "$total_price" },
      },
    },
    {
      $lookup: {
        from: "listings",
        localField: "_id",
        foreignField: "host.host_id",
        as: "listings",
      },
    },
    {
      $project: {
        host_id: "$_id",
        _id: 0,
        total_bookings: 1,
        total_revenue: { $round: ["$total_revenue", 2] },
        listings_count: { $size: "$listings" },
        avg_listing_price: {
          $round: [{ $avg: "$listings.price" }, 2],
        },
      },
    },
    { $sort: { total_revenue: -1 } },
    { $limit: 20 },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
