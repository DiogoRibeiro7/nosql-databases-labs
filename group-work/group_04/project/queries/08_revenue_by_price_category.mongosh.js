// Query 08: Revenue Analysis by Price Category
// Financial segmentation analysis
// Usage: mongosh queries/08_revenue_by_price_category.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Revenue Analysis by Price Category ===\n");

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
    // Group by price category
    {
      $group: {
        _id: "$listing.price_category",
        total_revenue: { $sum: "$total_price" },
        total_bookings: { $sum: 1 },
        total_nights: { $sum: "$nights" },
        avg_booking_value: { $avg: "$total_price" }
      }
    },
    // Sort by revenue descending
    { $sort: { total_revenue: -1 } }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
