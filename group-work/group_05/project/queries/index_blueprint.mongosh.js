/* eslint-disable */
db = db.getSiblingDB("group_05_final");

print("\n--- Creating Indexes ---");

// ====================================================
// COLLECTION: HOSTS
// ====================================================

// Primary Key
db.hosts.createIndex({ id: 1 }, { unique: true, name: "idx_hosts_id_unique" });

// Brand/Name Search
db.hosts.createIndex({ name: 1 }, { name: "idx_hosts_name" });

// ====================================================
// COLLECTION: LISTINGS
// ====================================================

// Primary Key
db.listings.createIndex({ id: 1 }, { unique: true, name: "idx_listings_id_unique" });

// Foreign Key
db.listings.createIndex({ host_id: 1 }, { name: "idx_listings_host_id" });

// Price Sorting (Critical for "Cheapest" queries)
db.listings.createIndex({ price: 1 }, { name: "idx_listings_price" });

// Geospatial + Scalar Filters (Compound Index)
// Supports: "Find hotel within 5km with specific capacity"
db.listings.createIndex(
  { location: "2dsphere", room_type: 1, accommodates: 1 },
  { name: "idx_geo_hotel_capacity" }
);

// Rating Filter
db.listings.createIndex({ review_scores_rating: -1 }, { name: "idx_listings_rating" });

// ====================================================
// COLLECTION: REVIEWS
// ====================================================

// Optimized Lookup Pipeline
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
// Supports: Checking if a start/end date overlaps with existing array ranges
db.reservations.createIndex(
  { listing_id: 1, "dates.0": 1, "dates.1": 1 },
  { name: "idx_reservations_conflict_detection" }
);

print("Indexes created successfully!");

// --- VERIFICATION ---
print("\n--- Listings Indexes ---");
db.listings.getIndexes().forEach((idx) => printjson(idx));

print("\n--- Hosts Indexes ---");
db.hosts.getIndexes().forEach((idx) => printjson(idx));

print("\n--- Reviews Indexes ---");
db.reviews.getIndexes().forEach((idx) => printjson(idx));

print("\n--- Reservations Indexes ---");
db.reservations.getIndexes().forEach((idx) => printjson(idx));

print("\nAll operations finished successfully!");
