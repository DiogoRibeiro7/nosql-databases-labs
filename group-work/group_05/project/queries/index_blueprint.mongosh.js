/* eslint-disable */
db = db.getSiblingDB("group_05_final");
print("\n--- Creating Indexes ---");

// --- Index Creation ---

// ====================================================
// COLLECTION: HOSTS
// ====================================================

// Primary Key / Foreign Key Target
db.hosts.createIndex({ id: 1 }, { unique: true, name: "idx_hosts_id_unique" });

// Brand Analysis
db.hosts.createIndex({ name: 1 }, { name: "idx_hosts_name" });

// ====================================================
// COLLECTION: LISTINGS
// ====================================================

// Primary Key
db.listings.createIndex({ id: 1 }, { unique: true, name: "idx_listings_id_unique" });

// Foreign Key
db.listings.createIndex({ host_id: 1 }, { name: "idx_listings_host_id" });

// Geospatial + Scalar Filters (Compound Index)
db.listings.createIndex(
  { location: "2dsphere", room_type: 1, accommodates: 1 },
  { name: "idx_geo_hotel_capacity" }
);

// Rating Filter
db.listings.createIndex({ review_scores_rating: -1 }, { name: "idx_listings_rating" });

// ====================================================
// COLLECTION: REVIEWS
// ====================================================

// Pipeline index
db.reviews.createIndex(
  { listing_id: 1, rating: -1, date: -1 },
  { name: "idx_reviews_lookup_optimized" }
);

// ====================================================
// COLLECTION: RESERVATIONS
// ====================================================

// Primary Key
db.reservations.createIndex({ id: 1 }, { unique: true, name: "idx_reservations_id_unique" });

// Conflict Detection
db.reservations.createIndex(
  { listing_id: 1, "dates.0": 1, "dates.1": 1 },
  { name: "idx_reservations_conflict_detection" }
);

print("Indexes created successfully!");

// Check indexes
print("\nCurrent Indexes on 'listings':");
print(db.listings.getIndexes());
print("\nCurrent Indexes on 'hosts':");
print(db.hosts.getIndexes());
print("\nCurrent Indexes on 'reviews':");
print(db.reviews.getIndexes());
print("\nCurrent Indexes on 'reservations':");
print(db.reservations.getIndexes());

print("\nAll operations finished successfully!");
