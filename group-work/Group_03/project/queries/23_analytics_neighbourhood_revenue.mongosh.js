// Query 23: Neighbourhood Revenue (Analytics)
// Query name: Neighbourhood Revenue (Analytics)
// Query question: Which neighbourhoods generate the most confirmed booking revenue?
// Business purpose: surface top-earning areas for local partnerships and marketing

db = db.getSiblingDB("group_03_airbnb");
print("=== ANALYTICS: NEIGHBOURHOOD REVENUE ===");

db.bookings
  .aggregate([
    { $match: { status: "confirmed" } },
    {
      $lookup: {
        from: "listings",
        localField: "listing_id",
        foreignField: "_id",
        as: "listing",
      },
    },
    { $unwind: "$listing" },
    {
      $group: {
        _id: "$listing.location.neighbourhood",
        total_revenue: { $sum: "$total_revenue" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { total_revenue: -1 } },
    { $limit: 10 },
  ])
  .forEach((d) => printjson(d));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
