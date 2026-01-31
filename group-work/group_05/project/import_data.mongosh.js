// import_data.mongosh.js

// Connect to the correct database
db = db.getSiblingDB("group_05_final");
console.log("Switched to database: group_05_final");

// Load the filesystem module
const fs = require("fs");

// Helper function to load, clean, and insert data
function loadAndInsert(collectionName, fileName, transformFn) {
  const filePath = `data/${fileName}`;

  if (!fs.existsSync(filePath)) {
    print(`Error: File not found at ${filePath}`);
    return;
  }

  print(`Reading ${fileName}...`);
  const rawData = fs.readFileSync(filePath, "utf8");
  let data = JSON.parse(rawData);

  if (!data || data.length === 0) {
    print(`No data found in ${fileName}, skipping.`);
    return;
  }

  // Apply data cleaning/transformation if a function is provided
  if (transformFn) {
    print(`Transforming data for ${collectionName}...`);
    data = data.map(transformFn);
  }

  // Drop existing collection to start fresh
  db.getCollection(collectionName).drop();
  print(`Dropped existing collection: ${collectionName}`);

  // Insert Data
  const result = db.getCollection(collectionName).insertMany(data);
  print(`Inserted documents into '${collectionName}'`);
}

// Transformation Logics

// Cleaner for listings
function cleanListing(doc) {
  // Normalize Price: Remove '$' and ',' and convert to Number
  if (doc.price && typeof doc.price === "string") {
    const numericPrice = parseFloat(doc.price.replace(/[€$,]/g, ""));

    doc.price = isNaN(numericPrice) ? 0 : numericPrice;
  }

  // Create GeoJSON Location: Essential for $geoNear queries
  if (doc.latitude && doc.longitude) {
    doc.location = {
      type: "Point",
      coordinates: [parseFloat(doc.longitude), parseFloat(doc.latitude)],
    };
  }

  return doc;
}

// Import Process

// Hosts
loadAndInsert("hosts", "hosts.json", null);

// Listings
loadAndInsert("listings", "listings.json", cleanListing);

// Reviews
loadAndInsert("reviews", "reviews.json", null);

// Reservations
loadAndInsert("reservations", "reservations.json", null);

// Index Creation
print("\nCreating Indexes");

// HOSTS
db.hosts.createIndex({ id: 1 }, { unique: true, name: "idx_hosts_id_unique" });
db.hosts.createIndex({ name: 1 }, { name: "idx_hosts_name" });

// LISTINGS
db.listings.createIndex({ id: 1 }, { unique: true, name: "idx_listings_id_unique" });
db.listings.createIndex({ host_id: 1 }, { name: "idx_listings_host_id" });

// Normalized Price Index
db.listings.createIndex({ price: 1 }, { name: "idx_listings_price" });

// Geospatial Index
db.listings.createIndex(
  { location: "2dsphere", room_type: 1, accommodates: 1 },
  { name: "idx_geo_hotel_capacity" }
);

// Rating Index
db.listings.createIndex({ review_scores_rating: -1 }, { name: "idx_listings_rating" });

// REVIEWS
db.reviews.createIndex(
  { listing_id: 1, rating: -1, date: -1 },
  { name: "idx_reviews_lookup_optimized" }
);

print("Indexes created successfully!");
print("All operations finished.");
