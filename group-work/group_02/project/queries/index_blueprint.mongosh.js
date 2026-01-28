// Index Blueprint - Sakila MongoDB Optimization
// Defines optimized indexes for business queries and performance
// Usage: mongosh queries/index_blueprint.mongosh.js

db = db.getSiblingDB("sakila_mongodb");
print(`Using database: ${db.getName()}`);

// Clear existing indexes (except mandatory _id)
print("\n=== Checking and Clearing Existing Indexes ===\n");

const collections = ["films", "customers", "rentals", "inventory", "stores"];
collections.forEach((collName) => {
  try {
    const existingIndexes = db[collName].getIndexes();
    if (existingIndexes.length > 1) {
      print(`${collName}: found ${existingIndexes.length} indexes. Removing...`);
      db[collName].dropIndexes();
      print(`${collName}: indexes removed successfully (except _id)`);
    } else {
      print(`${collName}: only _id index exists (nothing to remove)`);
    }
  } catch (error) {
    print(`${collName}: error removing indexes - ${error.message}`);
  }
});

print("\n=== Creating Unique Indexes ===\n");

// Unique indexes for primary keys
print("Applying unique indexes...");
printjson(db.films.createIndex({ film_id: 1 }, { unique: true, name: "idx_film_id_unique" }));
printjson(db.customers.createIndex({ customer_id: 1 }, { unique: true, name: "idx_customer_id_unique" }));
printjson(db.rentals.createIndex({ rental_id: 1 }, { unique: true, name: "idx_rental_id_unique" }));
printjson(db.inventory.createIndex({ inventory_id: 1 }, { unique: true, name: "idx_inventory_id_unique" }));
printjson(db.stores.createIndex({ store_id: 1 }, { unique: true, name: "idx_store_id_unique" }));

print("\n=== Indexes for Films ===\n");

// Index for category search
printjson(db.films.createIndex({ "category.name": 1 }, { name: "idx_category_name" }));

// Compound index for catalog filters
printjson(db.films.createIndex({ rating: 1, rental_rate: 1 }, { name: "idx_rating_rental_rate" }));

// Text index for full-text search
printjson(db.films.createIndex(
  { title: "text", description: "text" },
  { 
    weights: { title: 10, description: 1 }, 
    name: "idx_film_text_search",
    language_override: "textLanguage"  // Avoid conflict with embedded 'language' object
  }
));

print("\n=== Indexes for Customers ===\n");

// Index for email (authentication)
printjson(db.customers.createIndex({ email: 1 }, { name: "idx_customer_email" }));

// Index for customer segmentation
printjson(db.customers.createIndex({ store_id: 1, active: 1 }, { name: "idx_customer_segmentation" }));

// Index for geographic analysis
printjson(db.customers.createIndex(
  { "address.city.country": 1, "address.city.city_name": 1 },
  { name: "idx_customer_location" }
));

print("\n=== Indexes for Rentals ===\n");

// Index for customer history
printjson(db.rentals.createIndex(
  { "customer.customer_id": 1, rental_date: -1 },
  { name: "idx_customer_rental_history" }
));

// Index for temporal analysis
printjson(db.rentals.createIndex({ rental_date: -1 }, { name: "idx_rental_date_desc" }));

// Index for pending returns
printjson(db.rentals.createIndex(
  { return_date: 1, rental_date: 1 },
  { name: "idx_return_status" }
));

// Index for store/category aggregations
printjson(db.rentals.createIndex(
  { store_id: 1, "film.category": 1 },
  { name: "idx_store_category_analysis" }
));

// Index for film lookups
printjson(db.rentals.createIndex({ "film.film_id": 1 }, { name: "idx_rental_film_id" }));

print("\n=== Indexes for Inventory ===\n");

// Index for availability check
printjson(db.inventory.createIndex(
  { film_id: 1, store_id: 1, available: 1 },
  { name: "idx_availability_check" }
));

print("\n=== Index Summary ===\n");

collections.forEach((collName) => {
  const indexes = db[collName].getIndexes();
  print(`${collName}: ${indexes.length} indexes`);
});

print("\nDone. Run db.<collection>.getIndexes() to inspect the results.");

