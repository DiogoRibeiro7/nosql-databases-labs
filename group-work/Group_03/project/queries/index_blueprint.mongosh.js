// Filename: index_blueprint.mongosh.js
// Usage: mongosh index_blueprint.mongosh.js

db = db.getSiblingDB("group_03_airbnb");
print("=== CREATING INDEXES ===");

// 1. Geospatial Index
// Required for "find listings near me" queries
db.listings.createIndex({ "location.coordinates": "2dsphere" });
print("✓ Created 2dsphere index on location.");

// 2. Price Sorting & Filtering
// Optimize queries that look for budget/luxury ranges
db.listings.createIndex({ "pricing.daily_price": 1 });
print("✓ Created index on price.");

// 3. Neighbourhood Analytics
// Optimize "Group by neighbourhood" aggregations
db.listings.createIndex({ "location.neighbourhood": 1 });
print("✓ Created index on neighbourhood.");

// 4. Rating & Popularity
// Compound index: Find high-rated places that actually have reviews (trustworthy)
db.listings.createIndex({ "reviews.rating": -1, "reviews.count": -1 });
print("✓ Created compound index on reviews (rating + count).");

// 5. Host Lookups
// Fast retrieval of all listings belonging to a specific host
db.listings.createIndex({ "host.id": 1 });
print("✓ Created index on host ID.");

// 6. Text Search
// Enable keyword searching in listing names
db.listings.createIndex({ name: "text" });
print("✓ Created text index on listing name.");

// 7. Booking Analytics
// Optimize revenue calculation by grouping listings
db.bookings.createIndex({ listing_id: 1 });
print("✓ Created index on bookings (listing_id).");

print("=== INDEXING COMPLETE ===");
print("Ready for the first query execution.\n");
