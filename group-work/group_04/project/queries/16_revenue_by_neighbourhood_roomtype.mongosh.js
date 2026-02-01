// Query 16: Revenue by Neighbourhood and Room Type
// Cross-dimensional analysis
// Usage: mongosh queries/16_revenue_by_neighbourhood_roomtype.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Revenue by Neighbourhood and Room Type ===\n");

db.bookings
  .aggregate([
    // Only completed bookings
    { $match: { status: "completed" } },
    // Lookup listing details
    {
      $lookup: {
        from: "listings",
        localField: "listing_id",
        foreignField: "listing_id",
        as: "listing"
      }
    },
    { $unwind: "$listing" },
    // Group by neighbourhood and room type
    {
      $group: {
        _id: {
          neighbourhood: "$listing.location.neighbourhood",
          room_type: "$listing.room_type"
        },
        revenue: { $sum: "$total_price" },
        bookings: { $sum: 1 },
        total_nights: { $sum: "$nights" },
        avg_booking_value: { $avg: "$total_price" }
      }
    },
    // Sort by revenue descending
    { $sort: { revenue: -1 } },
    // Top 20 combinations
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
