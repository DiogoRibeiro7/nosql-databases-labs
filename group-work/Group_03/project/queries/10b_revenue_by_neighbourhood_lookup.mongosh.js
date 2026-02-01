// Query 10B: Revenue by Neighbourhood – Using Lookup
// Query name: Revenue by Neighbourhood (10B - bookings-driven)
// Query question: What is total revenue by neighbourhood (bookings-driven)?
// Business purpose: validate revenue allocation per area using booking records

db = db.getSiblingDB("group_03_airbnb");

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
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
