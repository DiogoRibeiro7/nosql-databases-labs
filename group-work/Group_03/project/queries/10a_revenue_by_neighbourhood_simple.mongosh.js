// Query 10A: Revenue by Neighbourhood – Simple Aggregation
// Query name: Revenue by Neighbourhood (10A - listings-driven)
// Query question: What is total revenue by neighbourhood (listings-driven)?
// Business purpose: compare neighbourhood revenue for local partnerships

db = db.getSiblingDB("group_03_airbnb");

// Approach: start from listings, lookup bookings to aggregate revenue by neighbourhood
db.listings
  .aggregate([
    {
      $lookup: { from: "bookings", localField: "_id", foreignField: "listing_id", as: "bookings" },
    },
    { $unwind: { path: "$bookings", preserveNullAndEmptyArrays: true } },
    { $match: { "bookings.status": "confirmed" } },
    {
      $group: {
        _id: "$location.neighbourhood",
        total_revenue: { $sum: "$bookings.total_revenue" },
        listings: { $addToSet: "$_id" },
      },
    },
    { $project: { total_revenue: 1, listings_count: { $size: "$listings" } } },
    { $sort: { total_revenue: -1 } },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
