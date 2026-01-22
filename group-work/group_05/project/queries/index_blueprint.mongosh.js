/* eslint-disable */
// Switch to the airbnb database
db = db.getSiblingDB("airbnb");
console.log("\n--- Creating Indexes ---");

// --- Index Creation ---

// ====================================================
// COLLECTION: HOSTS
// ====================================================

// A. Primary Key / Foreign Key Target
db.hosts.createIndex({ id: 1 }, { unique: true, name: "idx_hosts_id_unique" });

// B. Brand Analysis
db.hosts.createIndex({ name: 1 }, { name: "idx_hosts_name" });

// ====================================================
// COLLECTION: LISTINGS
// ====================================================

// A. Primary Key
db.listings.createIndex({ id: 1 }, { unique: true, name: "idx_listings_id_unique" });

// B. Foreign Key
db.listings.createIndex({ host_id: 1 }, { name: "idx_listings_host_id" });

// C. Geospatial + Scalar Filters (Compound Index)
db.listings.createIndex(
  { location: "2dsphere", room_type: 1, accommodates: 1 },
  { name: "idx_geo_hotel_capacity" }
);

// D. Rating Filter
db.listings.createIndex({ review_scores_rating: -1 }, { name: "idx_listings_rating" });

// ====================================================
// COLLECTION: REVIEWS
// ====================================================

// A. The "Perfect" Pipeline Index
db.reviews.createIndex(
  { listing_id: 1, rating: -1, date: -1 },
  { name: "idx_reviews_lookup_optimized" }
);
console.log("Indexes created successfully!");

// Check indexes
console.log("\nCurrent Indexes on 'listings':");
console.log(db.listings.getIndexes());
console.log("\nCurrent Indexes on 'hosts':");
console.log(db.hosts.getIndexes());
console.log("\nCurrent Indexes on 'reviews':");
console.log(db.reviews.getIndexes());

console.log("\nAll operations finished successfully!");
