// Query 24: CRUD Create Example
// Query name: CRUD Create Example
// Query question: How to insert a sample listing and associated booking?
// Business purpose: demonstrate basic create workflow for listings and bookings

db = db.getSiblingDB("group_03_airbnb");
print("=== CRUD: CREATE ===");

const sample = {
  name: "CRUD Example Studio",
  host: { id: "host_crud_1", name: "CRUD Host" },
  location: {
    neighbourhood: "Alfama",
    coordinates: { type: "Point", coordinates: [-9.131, 38.712] },
  },
  pricing: { daily_price: 65 },
  details: { room_type: "Entire home/apt" },
  reviews: { rating: 4.6, count: 8 },
  availability: { days_available_365: 220 },
};

const res = db.listings.insertOne(sample);
print(`Inserted listing _id: ${res.insertedId}`);

// Create a mock booking for the listing
const booking = {
  listing_id: res.insertedId,
  host_id: sample.host.id,
  booking_date: new Date(),
  status: "confirmed",
  nights: 2,
  total_revenue: sample.pricing.daily_price * 2,
};
const bres = db.bookings.insertOne(booking);
print(`Inserted booking _id: ${bres.insertedId}`);

print("\n✓ Query executed successfully\n");
print("\nRun next query!\n");
