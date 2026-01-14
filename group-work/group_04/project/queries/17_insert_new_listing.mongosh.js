// Query 17: Insert New Listing (CREATE)
// Demonstrates insert operation with validation
// Usage: mongosh queries/17_insert_new_listing.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Insert New Listing ===\n");

const newListing = {
  listing_id: 99999,
  name: "Modern Downtown Porto Studio",
  host: {
    host_id: 9999,
    host_name: "Group_04_Host"
  },
  location: {
    neighbourhood: "Baixa",
    coordinates: {
      latitude: 41.1496,
      longitude: -8.6109
    }
  },
  room_type: "Entire home/apt",
  price: NumberDecimal("85.00"),
  price_category: "mid-range",
  capacity: {
    accommodates: 4,
    bedrooms: 1,
    beds: 2
  },
  booking_rules: {
    minimum_nights: 2,
    availability_365: 300
  },
  reviews: {
    number_of_reviews: 0,
    review_scores_rating: null
  },
  created_at: new Date(),
  last_update: new Date()
};

// Check if listing already exists
const exists = db.listings.findOne({ listing_id: newListing.listing_id });

if (exists) {
  print("Listing already exists. Removing for demonstration...");
  db.listings.deleteOne({ listing_id: newListing.listing_id });
}

print("Inserting new listing:");
const result = db.listings.insertOne(newListing);
printjson(result);

print("\nListing inserted:");
db.listings
  .find(
    { listing_id: 99999 },
    { _id: 0, listing_id: 1, name: 1, "host.host_name": 1, "location.neighbourhood": 1, price: 1 }
  )
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");
