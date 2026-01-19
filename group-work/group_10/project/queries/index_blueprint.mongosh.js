
// queries/index_blueprint.mongosh.js

db = db.getSiblingDB("group_10_db");

print(`Using database: ${db.getName()}`);

print("\nRecreating recommended indexes...");


// ============================================================================
// CUSTOMERS
// ============================================================================

// Prevent duplicate accounts and support login/email lookups
db.customers.createIndex(
  { email: 1 },
  { unique: true, name: "uniq_email" }
);

// Fast filtering for active/inactive segmentations
db.customers.createIndex(
  { active: 1 },
  { name: "idx_active" }
);

// Regional reports and city-based segmentation
db.customers.createIndex(
  { "address.city": 1 },
  { name: "idx_city" }
);


// ============================================================================
// FILMS
// ============================================================================

// Text search on titles (supports multi‑word queries)
db.films.createIndex(
  { title: "text" },
  { name: "idx_text_title" }
);

// For sorting movies by release year
db.films.createIndex(
  { releaseYear: 1 },
  { name: "idx_release_year" }
);

// For filtering by price range
db.films.createIndex(
  { rentalRate: 1 },
  { name: "idx_rental_rate" }
);


// ============================================================================
// STORES
// ============================================================================

// Enforce store identity (unique code)
db.stores.createIndex(
  { storeId: 1 },
  { unique: true, name: "uniq_storeId" }
);

// Alphabetical listing, reports by store name
db.stores.createIndex(
  { storeName: 1 },
  { name: "idx_store_name" }
);

// Geospatial index for $near and geo analytics
db.stores.createIndex(
  { "address.location": "2dsphere" },
  { name: "idx_geo_location" }
);


// ============================================================================
// RENTALS
// ============================================================================

// Customer history, sorted by rentalDate
db.rentals.createIndex(
  { customerId: 1, rentalDate: -1 },
  { name: "idx_customer_history" }
);

// Fast lookup of overdue/rented/returned rentals
db.rentals.createIndex(
  { status: 1, rentalDate: -1 },
  { name: "idx_status_date" }
);

// Revenue aggregation by store
db.rentals.createIndex(
  { storeId: 1, rentalDate: -1 },
  { name: "idx_store_revenue" }
);

// For analytics on film popularity
db.rentals.createIndex(
  { "films.filmId": 1 },
  { name: "idx_film_usage" }
);


// ============================================================================
// Summary
// ============================================================================
print("\nIndexes successfully (re)created. Current index list:");

print("\nCUSTOMERS:");
printjson(db.customers.getIndexes());

print("\nFILMS:");
printjson(db.films.getIndexes());

print("\nSTORES:");
printjson(db.stores.getIndexes());

print("\nRENTALS:");
printjson(db.rentals.getIndexes());

print("\nDone.");

// ============================================================================
// End of index_blueprint.mongosh.js
// ============================================================================
