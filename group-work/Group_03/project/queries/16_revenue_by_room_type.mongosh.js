// Query 16: Revenue by Room Type
// Query name: Revenue by Room Type
// Query question: How much revenue is generated per room type (entire/home/room)?
// Business purpose: measure which product types drive most revenue

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Revenue by Room Type ===\n");

db.bookings
  .aggregate([
    { $match: { status: "confirmed" } },
    { $lookup: { from: "listings", localField: "listing_id", foreignField: "_id", as: "listing" } },
    { $unwind: "$listing" },
    {
      $group: {
        _id: "$listing.details.room_type",
        total_revenue: { $sum: "$total_revenue" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { total_revenue: -1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
