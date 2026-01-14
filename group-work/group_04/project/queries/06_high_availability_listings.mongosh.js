// Query 06: High Availability Listings (Available > 300 days)
// Investment opportunity analysis
// Usage: mongosh queries/06_high_availability_listings.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== High Availability Listings (>300 days/year) ===\n");

db.listings
  .find(
    { "booking_rules.availability_365": { $gt: 300 } },
    {
      _id: 0,
      listing_id: 1,
      name: 1,
      neighbourhood: "$location.neighbourhood",
      room_type: 1,
      price: 1,
      availability_365: "$booking_rules.availability_365",
      number_of_reviews: "$reviews.number_of_reviews"
    }
  )
  .sort({ "booking_rules.availability_365": -1 })
  .limit(15)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
