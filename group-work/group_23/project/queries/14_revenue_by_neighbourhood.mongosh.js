// Revenue by neighbourhood (reservations -> listings join).
// Usage: mongosh queries/14_revenue_by_neighbourhood.mongosh.js

db = db.getSiblingDB("staybook");
print("Revenue by neighbourhood:");

db.reservations
  .aggregate([
    { $match: { status: { $in: ["confirmed", "completed"] } } },
    { $lookup: { from: "listings", localField: "listingId", foreignField: "id", as: "listing" } },
    { $unwind: "$listing" },
    {
      $group: {
        _id: "$listing.neighbourhood",
        revenue: { $sum: "$totalPrice" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ])
  .forEach((doc) => printjson(doc));
