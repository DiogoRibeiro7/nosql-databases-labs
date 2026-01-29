// Filename: import_data.mongosh.js
// Usage: mongosh import_data.mongosh.js

// 1. Setup Database
db = db.getSiblingDB("group_03_airbnb");
print(`\n=== IMPORTING LISBON DATA INTO: ${db.getName()} ===`);

// 2. Clear existing collections
db.listings.drop();
db.bookings.drop(); // We will generate mock bookings for analysis
print("✓ Dropped existing 'listings' and 'bookings' collections.");

// 3. Load the raw data (assumed imported into a temporary collection via mongoimport)
// Example mongoimport command (run from your shell, not inside mongosh):
//   mongoimport --db=group_03_airbnb --collection=raw_listings --file=./data/sample_lisbon_listings.json --jsonArray
let rawData = db.raw_listings.find().toArray();
if (!rawData || rawData.length === 0) {
  print("Error: No raw data found in 'raw_listings' collection. Make sure you ran mongoimport.");
  quit();
}
print(`✓ Loaded ${rawData.length} raw records from 'raw_listings'.`);

// 4. Transform Data
const transformedListings = rawData.map((item) => {
  // Clean price string (remove €)
  const priceVal = parseFloat(item.price.replace("€", ""));

  // Categorize price
  let category;
  if (priceVal < 80) category = "Budget";
  else if (priceVal > 200) category = "Luxury";
  else category = "Premium";

  return {
    _id: item.id, // Use the provided ID as MongoDB _id
    name: item.name,
    host: {
      id: item.host_id,
      name: item.host_name,
    },
    location: {
      neighbourhood: item.neighbourhood,
      // Create GeoJSON point for geospatial queries
      coordinates: {
        type: "Point",
        coordinates: [item.longitude, item.latitude],
      },
    },
    details: {
      room_type: item.room_type,
      accommodates: item.accommodates,
      bedrooms: item.bedrooms,
      beds: item.beds,
    },
    pricing: {
      daily_price: priceVal,
      currency: "EUR",
      category: category,
    },
    reviews: {
      count: item.number_of_reviews,
      rating: item.review_scores_rating,
    },
    availability: {
      minimum_nights: item.minimum_nights,
      days_available_365: item.availability_365,
    },
  };
});

// 5. Insert Listings
db.listings.insertMany(transformedListings);
print(`✓ Inserted ${transformedListings.length} listing documents.`);

// 6. Generate Mock Bookings (for Business Questions related to Revenue)
print("Generating mock bookings for analytics...");
const bookings = [];
const listingIds = transformedListings.map((l) => l._id);

listingIds.forEach((lId) => {
  // Generate 0 to 5 bookings per listing
  const numBookings = Math.floor(Math.random() * 6);
  const listingDoc = db.listings.findOne({ _id: lId });

  for (let i = 0; i < numBookings; i++) {
    const nights = Math.floor(Math.random() * 5) + listingDoc.availability.minimum_nights;
    const total = nights * listingDoc.pricing.daily_price;

    bookings.push({
      listing_id: lId,
      host_id: listingDoc.host.id,
      booking_date: new Date(), // Just using today for simplicity
      nights: nights,
      total_revenue: total,
      status: "confirmed",
    });
  }
});

if (bookings.length > 0) {
  db.bookings.insertMany(bookings);
}
print(`✓ Generated and inserted ${bookings.length} mock bookings.`);

// 7. Build hosts collection from listings + bookings
print("Building hosts collection from listings and bookings...");
// Drop existing hosts if any
db.hosts.drop();

const hostsFromListings = db.listings
  .aggregate([
    {
      $group: {
        _id: "$host.id",
        name: { $first: "$host.name" },
        listings_count: { $sum: 1 },
        avg_price: { $avg: "$pricing.daily_price" },
      },
    },
  ])
  .toArray();

const bookingsAgg = db.bookings
  .aggregate([
    { $match: { status: "confirmed" } },
    {
      $group: { _id: "$host_id", total_revenue: { $sum: "$total_revenue" }, bookings: { $sum: 1 } },
    },
  ])
  .toArray();

const revenueMap = {};
bookingsAgg.forEach((b) => {
  revenueMap[b._id] = { total_revenue: b.total_revenue || 0, bookings: b.bookings || 0 };
});

const hostsDocs = hostsFromListings.map((h) => ({
  host_id: h._id,
  name: h.name || null,
  listings_count: h.listings_count || 0,
  avg_price: h.avg_price ? Math.round(h.avg_price * 100) / 100 : null,
  total_revenue: revenueMap[h._id] ? revenueMap[h._id].total_revenue : 0,
  bookings: revenueMap[h._id] ? revenueMap[h._id].bookings : 0,
}));

if (hostsDocs.length > 0) {
  db.hosts.insertMany(hostsDocs);
  print(`✓ Created hosts collection with ${hostsDocs.length} documents.`);
} else {
  print("No host documents to insert.");
}

print("=== IMPORT COMPLETE ===");
