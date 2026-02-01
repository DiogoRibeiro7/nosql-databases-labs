// Index Blueprint: Porto Airbnb Database
// Idempotent script that creates all required indexes for optimal query performance
// Usage: mongosh queries/index_blueprint.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Creating Indexes for group_04_airbnb ===\n");

// ============================================================================
// LISTINGS COLLECTION INDEXES
// ============================================================================

print("=== Indexes for Listings ===\n");

// Primary lookup index
printjson(db.listings.createIndex(
  { listing_id: 1 },
  { name: "idx_listing_id", unique: true }
));

// Neighbourhood analysis
printjson(db.listings.createIndex(
  { "location.neighbourhood": 1 },
  { name: "idx_neighbourhood" }
));

// Price range queries
printjson(db.listings.createIndex(
  { price: 1 },
  { name: "idx_price" }
));

// Price category segmentation
printjson(db.listings.createIndex(
  { price_category: 1, price: 1 },
  { name: "idx_price_category_price" }
));

// Room type analysis
printjson(db.listings.createIndex(
  { room_type: 1, price: 1 },
  { name: "idx_room_type_price" }
));

// Review-based queries
printjson(db.listings.createIndex(
  { "reviews.number_of_reviews": -1 },
  { name: "idx_reviews_count" }
));

// Rating-based queries
printjson(db.listings.createIndex(
  { "reviews.review_scores_rating": -1 },
  { name: "idx_rating" }
));

// Availability analysis
printjson(db.listings.createIndex(
  { "booking_rules.availability_365": -1 },
  { name: "idx_availability" }
));

// Host lookup
printjson(db.listings.createIndex(
  { "host.host_id": 1 },
  { name: "idx_host_id" }
));

// Compound index for neighbourhood + room type analysis
printjson(db.listings.createIndex(
  { "location.neighbourhood": 1, room_type: 1, price: 1 },
  { name: "idx_neighbourhood_roomtype_price" }
));

// Text index for search
printjson(db.listings.createIndex(
  { name: "text" },
  { name: "idx_listing_name_text" }
));

// ============================================================================
// HOSTS COLLECTION INDEXES
// ============================================================================

print("\n=== Indexes for Hosts ===\n");

// Primary lookup index
printjson(db.hosts.createIndex(
  { host_id: 1 },
  { name: "idx_host_id", unique: true }
));

// Listings count for top hosts
printjson(db.hosts.createIndex(
  { listings_count: -1 },
  { name: "idx_listings_count" }
));

// Average price analysis
printjson(db.hosts.createIndex(
  { avg_price: -1 },
  { name: "idx_avg_price" }
));

// ============================================================================
// BOOKINGS COLLECTION INDEXES
// ============================================================================

print("\n=== Indexes for Bookings ===\n");

// Primary lookup index
printjson(db.bookings.createIndex(
  { booking_id: 1 },
  { name: "idx_booking_id", unique: true }
));

// Listing lookup for revenue analysis
printjson(db.bookings.createIndex(
  { listing_id: 1 },
  { name: "idx_booking_listing_id" }
));

// Host revenue analysis
printjson(db.bookings.createIndex(
  { host_id: 1 },
  { name: "idx_booking_host_id" }
));

// Status filtering
printjson(db.bookings.createIndex(
  { status: 1 },
  { name: "idx_booking_status" }
));

// Temporal analysis
printjson(db.bookings.createIndex(
  { check_in: -1 },
  { name: "idx_check_in_date" }
));

// Compound index for status + listing analysis
printjson(db.bookings.createIndex(
  { status: 1, listing_id: 1 },
  { name: "idx_status_listing" }
));

// Compound index for temporal revenue analysis
printjson(db.bookings.createIndex(
  { status: 1, check_in: -1, total_price: 1 },
  { name: "idx_status_date_revenue" }
));

// Guest lookup
printjson(db.bookings.createIndex(
  { "guest.guest_id": 1 },
  { name: "idx_guest_id" }
));

print("\n=== All Indexes Created Successfully ===\n");

// List all indexes
print("Index Summary:\n");
["listings", "hosts", "bookings"].forEach((coll) => {
  print(`${coll}:`);
  db[coll].getIndexes().forEach((idx) => {
    print(`  - ${idx.name}`);
  });
  print("");
});

print("✓ Index blueprint executed successfully\n");
