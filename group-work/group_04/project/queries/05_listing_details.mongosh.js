// Query 05: Listing Details for Specific ID
// Customer service lookup via find()
// Usage: mongosh queries/05_listing_details.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

const TARGET_LISTING_ID = 10005;

print(`\n=== Listing Details - ID ${TARGET_LISTING_ID} ===\n`);

print("Listing Information:");
db.listings
  .find(
    { listing_id: TARGET_LISTING_ID },
    {
      _id: 0,
      listing_id: 1,
      name: 1,
      host: 1,
      location: 1,
      room_type: 1,
      price: 1,
      capacity: 1,
      reviews: 1
    }
  )
  .forEach((doc) => printjson(doc));

print("\nBookings for this listing:");
db.bookings
  .find(
    { listing_id: TARGET_LISTING_ID },
    { _id: 0, booking_id: 1, check_in: 1, check_out: 1, nights: 1, total_price: 1, status: 1 }
  )
  .sort({ check_in: -1 })
  .limit(5)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
