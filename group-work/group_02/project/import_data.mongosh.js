// ============================================================================
// Sakila MongoDB Data Import Script
// ============================================================================
// Converts Sakila relational data (CSV/JSON) to NoSQL document model
// Implements denormalization strategy with embedding and references
// ============================================================================

print("\n=== Sakila MongoDB Import - Initialization ===\n");

// Database configuration
const DB_NAME = "sakila_mongodb";
db = db.getSiblingDB(DB_NAME);

print(`Active database: ${DB_NAME}`);
print("Removing existing collections for clean import...\n");

// Drop existing collections
db.films.drop();
db.customers.drop();
db.rentals.drop();
db.inventory.drop();
db.stores.drop();

print("Collections dropped. Starting import...\n");

// ============================================================================
// PHASE 1: Load raw data from JSON files
// ============================================================================

print("PHASE 1: Reading source JSON files...");

const fs = require('fs');
const dataPath = "./data/";

// Helper function to read JSON files
function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(dataPath + filename, 'utf8'));
}

// Load auxiliary data
const languagesRaw = loadJSON('language.json');
const categoriesRaw = loadJSON('category.json');
const actorsRaw = loadJSON('actor.json');
const filmActorsRaw = loadJSON('film_actor.json');
const filmCategoriesRaw = loadJSON('film_category.json');

// Load main data
const filmsRaw = loadJSON('film.json');
const customersRaw = loadJSON('customer.json');
const addressesRaw = loadJSON('address.json');
const citiesRaw = loadJSON('city.json');
const countriesRaw = loadJSON('country.json');
const rentalsRaw = loadJSON('rental.json');
const paymentsRaw = loadJSON('payment.json');
const inventoryRaw = loadJSON('inventory.json');
const storesRaw = loadJSON('store.json');
const staffRaw = loadJSON('staff.json');

print(`✓ Files loaded: ${filmsRaw.length} films, ${customersRaw.length} customers, ${rentalsRaw.length} rentals\n`);

// ============================================================================
// PHASE 2: Build lookup maps for denormalization
// ============================================================================

print("PHASE 2: Building lookup indexes...");

// Language map
const languageMap = new Map();
languagesRaw.forEach(lang => {
  languageMap.set(lang.language_id, {
    language_id: lang.language_id,
    name: lang.name
  });
});

// Category map
const categoryMap = new Map();
categoriesRaw.forEach(cat => {
  categoryMap.set(cat.category_id, {
    category_id: cat.category_id,
    name: cat.name
  });
});

// Actor map
const actorMap = new Map();
actorsRaw.forEach(actor => {
  actorMap.set(actor.actor_id, {
    actor_id: actor.actor_id,
    first_name: actor.first_name,
    last_name: actor.last_name
  });
});

// Film to actors map (N:M aggregation)
const filmActorsMap = new Map();
filmActorsRaw.forEach(fa => {
  if (!filmActorsMap.has(fa.film_id)) {
    filmActorsMap.set(fa.film_id, []);
  }
  const actor = actorMap.get(fa.actor_id);
  if (actor) {
    filmActorsMap.get(fa.film_id).push(actor);
  }
});

// Film to category map
const filmCategoryMap = new Map();
filmCategoriesRaw.forEach(fc => {
  const category = categoryMap.get(fc.category_id);
  if (category) {
    filmCategoryMap.set(fc.film_id, category);
  }
});

// Country map
const countryMap = new Map();
countriesRaw.forEach(country => {
  countryMap.set(country.country_id, country.country);
});

// City map (with embedded country)
const cityMap = new Map();
citiesRaw.forEach(city => {
  cityMap.set(city.city_id, {
    city_id: city.city_id,
    city_name: city.city,
    country: countryMap.get(city.country_id) || "Unknown"
  });
});

// Address map (with embedded city/country)
const addressMap = new Map();
addressesRaw.forEach(addr => {
  const city = cityMap.get(addr.city_id);
  addressMap.set(addr.address_id, {
    address_id: addr.address_id,
    address_line: addr.address,
    district: addr.district || "",
    postal_code: addr.postal_code || "",
    phone: addr.phone || "",
    city: city || { city_name: "Unknown", country: "Unknown" }
  });
});

// Staff map
const staffMap = new Map();
staffRaw.forEach(staff => {
  staffMap.set(staff.staff_id, {
    staff_id: staff.staff_id,
    first_name: staff.first_name,
    last_name: staff.last_name,
    email: staff.email,
    active: staff.active === 1
  });
});

// Payment map (rental_id -> payment)
const paymentMap = new Map();
paymentsRaw.forEach(payment => {
  paymentMap.set(payment.rental_id, {
    payment_id: payment.payment_id,
    amount: NumberDecimal(payment.amount.toString()),
    payment_date: new Date(payment.payment_date)
  });
});

print(`✓ Maps created: ${filmActorsMap.size} films with actors, ${paymentMap.size} payments\n`);

// ============================================================================
// PHASE 3: Transform and insert FILMS collection (enriched)
// ============================================================================

print("PHASE 3: Inserting enriched films...");

const filmsTransformed = filmsRaw.map(film => {
  const actors = filmActorsMap.get(film.film_id) || [];
  const category = filmCategoryMap.get(film.film_id) || { category_id: null, name: "Uncategorized" };
  const language = languageMap.get(film.language_id) || { language_id: null, name: "Unknown" };
  
  // Process special_features (comma-delimited string -> array)
  let specialFeatures = [];
  if (film.special_features) {
    specialFeatures = film.special_features.split(',').map(f => f.trim());
  }
  
  return {
    film_id: film.film_id,
    title: String(film.title || ""),
    description: String(film.description || ""),
    release_year: film.release_year || 2006,
    language: language,
    rental_duration: film.rental_duration || 3,
    rental_rate: NumberDecimal(film.rental_rate.toString()),
    length: film.length || 0,
    replacement_cost: NumberDecimal(film.replacement_cost.toString()),
    rating: String(film.rating || "G"),
    special_features: specialFeatures,
    category: category,
    actors: actors,
    last_update: new Date(film.last_update)
  };
});

db.films.insertMany(filmsTransformed);
print(`✓ ${filmsTransformed.length} films inserted with embedded categories and actors\n`);

// ============================================================================
// PHASE 4: Transform and insert INVENTORY collection
// ============================================================================

print("PHASE 4: Inserting inventory...");

const inventoryTransformed = inventoryRaw.map(inv => ({
  inventory_id: inv.inventory_id,
  film_id: inv.film_id,
  store_id: inv.store_id,
  available: true, // Will be updated based on active rentals
  current_rental_id: null,
  last_update: new Date(inv.last_update)
}));

db.inventory.insertMany(inventoryTransformed);
print(`✓ ${inventoryTransformed.length} inventory items inserted\n`);

// ============================================================================
// PHASE 5: Transform and insert STORES collection
// ============================================================================

print("PHASE 5: Inserting stores...");

const storesTransformed = storesRaw.map(store => {
  const manager = staffMap.get(store.manager_staff_id);
  const address = addressMap.get(store.address_id);
  
  return {
    store_id: store.store_id,
    manager: manager || {},
    address: address || {},
    total_inventory: inventoryTransformed.filter(i => i.store_id === store.store_id).length,
    total_customers: 0, // Will be updated after customer insertion
    last_update: new Date(store.last_update)
  };
});

db.stores.insertMany(storesTransformed);
print(`✓ ${storesTransformed.length} stores inserted\n`);

// ============================================================================
// PHASE 6: Create film map for embedding in rentals
// ============================================================================

print("PHASE 6: Preparing denormalization maps for rentals...");

const filmMap = new Map();
db.films.find().forEach(film => {
  filmMap.set(film.film_id, {
    film_id: film.film_id,
    title: film.title,
    category: film.category.name,
    rental_rate: film.rental_rate
  });
});

const inventoryFilmMap = new Map();
inventoryTransformed.forEach(inv => {
  inventoryFilmMap.set(inv.inventory_id, {
    film_id: inv.film_id,
    store_id: inv.store_id
  });
});

print(`✓ Film map created for embedding\n`);

// ============================================================================
// PHASE 7: Transform and insert CUSTOMERS collection (with rental summary)
// ============================================================================

print("PHASE 7: Inserting customers with rental history...");

// Create rental_id -> rental map for embedding in customers
const rentalsByCustomer = new Map();
rentalsRaw.forEach(rental => {
  if (!rentalsByCustomer.has(rental.customer_id)) {
    rentalsByCustomer.set(rental.customer_id, []);
  }
  rentalsByCustomer.get(rental.customer_id).push(rental);
});

const customersTransformed = customersRaw.map(customer => {
  const address = addressMap.get(customer.address_id) || {};
  const customerRentals = rentalsByCustomer.get(customer.customer_id) || [];
  
  // Sort rentals by date and get the 10 most recent
  const recentRentals = customerRentals
    .sort((a, b) => new Date(b.rental_date) - new Date(a.rental_date))
    .slice(0, 10)
    .map(rental => {
      const invInfo = inventoryFilmMap.get(rental.inventory_id) || {};
      const filmInfo = filmMap.get(invInfo.film_id) || { title: "Unknown" };
      const payment = paymentMap.get(rental.rental_id);
      
      return {
        rental_id: rental.rental_id,
        rental_date: new Date(rental.rental_date),
        film_title: filmInfo.title,
        return_date: rental.return_date ? new Date(rental.return_date) : null,
        amount: payment ? payment.amount : NumberDecimal("0")
      };
    });
  
  // Calcular lifetime value
  const lifetimeValue = customerRentals.reduce((sum, rental) => {
    const payment = paymentMap.get(rental.rental_id);
    return sum + (payment ? parseFloat(payment.amount.toString()) : 0);
  }, 0);
  
  return {
    customer_id: customer.customer_id,
    store_id: customer.store_id,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    address: address,
    active: customer.active === 1,
    create_date: new Date(customer.create_date),
    recent_rentals: recentRentals,
    lifetime_rentals: customerRentals.length,
    lifetime_value: NumberDecimal(lifetimeValue.toFixed(2)),
    last_update: new Date(customer.last_update)
  };
});

db.customers.insertMany(customersTransformed);
print(`✓ ${customersTransformed.length} customers inserted with embedded rentals\n`);

// Update total_customers in stores
db.stores.updateOne({ store_id: 1 }, { $set: { total_customers: customersTransformed.filter(c => c.store_id === 1).length }});
db.stores.updateOne({ store_id: 2 }, { $set: { total_customers: customersTransformed.filter(c => c.store_id === 2).length }});

// ============================================================================
// PHASE 8: Transform and insert RENTALS collection (with embeddings)
// ============================================================================

print("PHASE 8: Inserting rentals with embeddings...");

const customerSummaryMap = new Map();
db.customers.find({}, { customer_id: 1, first_name: 1, last_name: 1, email: 1 }).forEach(cust => {
  customerSummaryMap.set(cust.customer_id, {
    customer_id: cust.customer_id,
    full_name: `${cust.first_name} ${cust.last_name}`,
    email: cust.email
  });
});

const rentalsTransformed = rentalsRaw.map(rental => {
  const invInfo = inventoryFilmMap.get(rental.inventory_id) || {};
  const filmInfo = filmMap.get(invInfo.film_id) || {};
  const customerInfo = customerSummaryMap.get(rental.customer_id) || {};
  const payment = paymentMap.get(rental.rental_id) || { payment_id: null, amount: NumberDecimal("0"), payment_date: null };
  
  const rentalDate = new Date(rental.rental_date);
  const returnDate = rental.return_date ? new Date(rental.return_date) : null;
  const durationDays = returnDate ? Math.ceil((returnDate - rentalDate) / (1000 * 60 * 60 * 24)) : null;
  
  return {
    rental_id: rental.rental_id,
    rental_date: rentalDate,
    inventory_id: rental.inventory_id,
    customer: customerInfo,
    film: filmInfo,
    store_id: invInfo.store_id || 1,
    staff_id: rental.staff_id,
    return_date: returnDate,
    payment: payment,
    rental_duration_days: durationDays,
    is_overdue: returnDate === null && (new Date() - rentalDate) > (7 * 24 * 60 * 60 * 1000), // >7 dias
    last_update: new Date(rental.last_update)
  };
});

db.rentals.insertMany(rentalsTransformed);
print(`✓ ${rentalsTransformed.length} rentals inserted with embedded customer/film\n`);

// Update inventory availability
const activeRentals = rentalsTransformed.filter(r => r.return_date === null);
activeRentals.forEach(rental => {
  db.inventory.updateOne(
    { inventory_id: rental.inventory_id },
    { 
      $set: { 
        available: false,
        current_rental_id: rental.rental_id
      }
    }
  );
});

print(`✓ Inventory updated: ${activeRentals.length} items marked as unavailable\n`);

// ============================================================================
// PHASE 9: Creation of basic indexes (complete blueprint in queries/)
// ============================================================================

print("PHASE 9: Creating essential indexes...");

db.films.createIndex({ film_id: 1 }, { unique: true });
db.films.createIndex({ "category.name": 1 });
db.films.createIndex(
  { title: "text", description: "text" }, 
  { 
    name: "film_search",
    default_language: "english",
    language_override: "none",
    weights: { title: 10, description: 1 }
  }
);

db.customers.createIndex({ customer_id: 1 }, { unique: true });
db.customers.createIndex({ email: 1 });

db.rentals.createIndex({ rental_id: 1 }, { unique: true });
db.rentals.createIndex({ "customer.customer_id": 1, rental_date: -1 });

db.inventory.createIndex({ inventory_id: 1 }, { unique: true });
db.inventory.createIndex({ film_id: 1, store_id: 1, available: 1 });

db.stores.createIndex({ store_id: 1 }, { unique: true });

print("✓ Essential indexes created\n");

// ============================================================================
// PHASE 10: Final statistics and validation
// ============================================================================

print("\n=== IMPORT COMPLETED SUCCESSFULLY ===\n");

print("Collection statistics:");
print(`  - films:     ${db.films.countDocuments()} documents`);
print(`  - customers: ${db.customers.countDocuments()} documents`);
print(`  - rentals:   ${db.rentals.countDocuments()} documents`);
print(`  - inventory: ${db.inventory.countDocuments()} documents`);
print(`  - stores:    ${db.stores.countDocuments()} documents`);

print("\nQuery examples:");
print("  db.films.findOne({ title: /ACADEMY/ })");
print("  db.customers.findOne({ customer_id: 1 })");
print("  db.rentals.find({ 'customer.customer_id': 1 }).limit(5)");

print("\nNext steps:");
print("  1. mongosh queries/index_blueprint.mongosh.js  (optimized indexes)");
print("  2. mongosh tests/data_quality.mongosh.js       (validation)");
print("  3. mongosh queries/01_*.mongosh.js             (business queries)");

print("\n===========================================\n");
