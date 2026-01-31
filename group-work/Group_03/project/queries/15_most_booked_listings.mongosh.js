// Query 15: Most Booked Listings
// Query name: Most Booked Listings
// Query question: Which listings have the largest number of bookings?
// Business purpose: identify high-demand assets for investment or fee adjustments

db = db.getSiblingDB("group_03_airbnb");

print("\n=== Most Booked Listings ===\n");

db.bookings
  .aggregate([
    { $group: { _id: "$listing_id", total_bookings: { $sum: 1 } } },
    { $sort: { total_bookings: -1 } },
    { $limit: 10 },
    { $lookup: { from: "listings", localField: "_id", foreignField: "_id", as: "listing" } },
    { $unwind: "$listing" },
    {
      $project: {
        listing_id: "$_id",
        total_bookings: 1,
        name: "$listing.name",
        neighbourhood: "$listing.location.neighbourhood",
      },
    },
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
