// Import Script: Porto Airbnb Listings
// Imports JSON data into MongoDB and creates the listings collection
// Usage: mongosh queries/import_data.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Porto Airbnb Data Import ===\n");

// Drop existing collection for idempotent imports
print("Dropping existing collections...");
db.listings.drop();
db.hosts.drop();
db.bookings.drop();
print("✓ Collections dropped\n");

// Load data from JSON file
print("Loading data from JSON file...");
const fs = require("fs");
const dataPath = "data/sample_porto_listings.json";

let listingsRaw;
try {
  listingsRaw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  print(`✓ Loaded ${listingsRaw.length} listings from file\n`);
} catch (e) {
  print(`Error loading file: ${e.message}`);
  print("Make sure you're running from the project directory.");
  quit(1);
}

// Transform data - clean price field and add computed fields
print("Transforming data...");
const listingsTransformed = listingsRaw.map((listing) => {
  // Parse price string to number (remove € symbol)
  const priceStr = listing.price.replace("€", "").trim();
  const priceNum = parseFloat(priceStr);

  return {
    listing_id: listing.id,
    name: listing.name,
    host: {
      host_id: listing.host_id,
      host_name: listing.host_name,
    },
    location: {
      neighbourhood: listing.neighbourhood,
      coordinates: {
        latitude: listing.latitude,
        longitude: listing.longitude,
      },
    },
    room_type: listing.room_type,
    price: NumberDecimal(priceNum.toFixed(2)),
    price_category:
      priceNum <= 50
        ? "budget"
        : priceNum <= 100
          ? "mid-range"
          : priceNum <= 150
            ? "premium"
            : "luxury",
    capacity: {
      accommodates: listing.accommodates,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
    },
    booking_rules: {
      minimum_nights: listing.minimum_nights,
      availability_365: listing.availability_365,
    },
    reviews: {
      number_of_reviews: listing.number_of_reviews,
      review_scores_rating: listing.review_scores_rating,
    },
    created_at: new Date(),
    last_update: new Date(),
  };
});

// Insert listings
print("Inserting listings...");
db.listings.insertMany(listingsTransformed);
print(`✓ ${listingsTransformed.length} listings inserted\n`);

// Create hosts collection (denormalized for analytics)
print("Creating hosts collection...");
const hostsMap = new Map();
listingsTransformed.forEach((listing) => {
  const hostId = listing.host.host_id;
  if (!hostsMap.has(hostId)) {
    hostsMap.set(hostId, {
      host_id: hostId,
      host_name: listing.host.host_name,
      listings_count: 0,
      total_capacity: 0,
      neighbourhoods: new Set(),
      room_types: new Set(),
      avg_price: 0,
      prices: [],
    });
  }
  const host = hostsMap.get(hostId);
  host.listings_count++;
  host.total_capacity += listing.capacity.accommodates;
  host.neighbourhoods.add(listing.location.neighbourhood);
  host.room_types.add(listing.room_type);
  host.prices.push(parseFloat(listing.price.toString()));
});

const hostsTransformed = Array.from(hostsMap.values()).map((host) => ({
  host_id: host.host_id,
  host_name: host.host_name,
  listings_count: host.listings_count,
  total_capacity: host.total_capacity,
  neighbourhoods: Array.from(host.neighbourhoods),
  room_types: Array.from(host.room_types),
  avg_price: NumberDecimal(
    (host.prices.reduce((a, b) => a + b, 0) / host.prices.length).toFixed(2)
  ),
  created_at: new Date(),
}));

db.hosts.insertMany(hostsTransformed);
print(`✓ ${hostsTransformed.length} hosts inserted\n`);

// Create sample bookings collection
print("Creating sample bookings...");
const bookings = [];
const today = new Date();

listingsTransformed.slice(0, 50).forEach((listing, index) => {
  const numBookings = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < numBookings; i++) {
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() - Math.floor(Math.random() * 365));
    const nights = listing.booking_rules.minimum_nights + Math.floor(Math.random() * 5);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);
    const pricePerNight = parseFloat(listing.price.toString());

    bookings.push({
      booking_id: index * 10 + i + 1,
      listing_id: listing.listing_id,
      listing_name: listing.name,
      host_id: listing.host.host_id,
      guest: {
        guest_id: 2000 + Math.floor(Math.random() * 500),
        guest_name: `Guest_${Math.floor(Math.random() * 500)}`,
      },
      check_in: checkIn,
      check_out: checkOut,
      nights: nights,
      total_price: NumberDecimal((pricePerNight * nights).toFixed(2)),
      status: Math.random() > 0.1 ? "completed" : "cancelled",
      created_at: new Date(checkIn.getTime() - 7 * 24 * 60 * 60 * 1000),
    });
  }
});

db.bookings.insertMany(bookings);
print(`✓ ${bookings.length} bookings inserted\n`);

// Final statistics
print("=== IMPORT COMPLETED SUCCESSFULLY ===\n");
print("Collection statistics:");
print(`  - listings: ${db.listings.countDocuments()} documents`);
print(`  - hosts:    ${db.hosts.countDocuments()} documents`);
print(`  - bookings: ${db.bookings.countDocuments()} documents`);

print("\nSample listing:");
printjson(db.listings.findOne());

print("\n✓ Database 'group_04_airbnb' is ready for queries\n");
