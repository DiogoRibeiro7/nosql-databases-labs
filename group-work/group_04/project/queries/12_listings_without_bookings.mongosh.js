// Query 12: Listings Without Bookings
// Underperforming inventory identification
// Usage: mongosh queries/12_listings_without_bookings.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Listings Without Any Bookings ===\n");

// Get all listing IDs with bookings
const listingsWithBookings = db.bookings.distinct("listing_id");

db.listings
  .find(
    { listing_id: { $nin: listingsWithBookings } },
    {
      _id: 0,
      listing_id: 1,
      name: 1,
      host: 1,
      neighbourhood: "$location.neighbourhood",
      room_type: 1,
      price: 1,
      availability_365: "$booking_rules.availability_365",
      number_of_reviews: "$reviews.number_of_reviews"
    }
  )
  .sort({ price: 1 })
  .limit(25)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
