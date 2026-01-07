
// Suggested MongoDB Collections:
// 1. listings (with GeoJSON for location)
// 2. hosts (with embedded listings)
// 3. neighborhoods (with statistics)

db.listings.insertOne({
  listing_id: 17803,
  name: "Ribeira Charming Duplex",
  host: {
    host_id: 67207,
    name: "Gonçalo",
    response_rate: "100%",
    is_superhost: true
  },
  location: {
    type: "Point",
    coordinates: [-8.61308, 41.14053],  // [longitude, latitude]
    neighborhood: "Cedofeita",
    city: "Porto"
  },
  property: {
    room_type: "Entire home/apt",
    accommodates: 8,
    bedrooms: 3,
    beds: 5,
    bathrooms: 2
  },
  pricing: {
    price_per_night: 80,
    cleaning_fee: 35,
    minimum_nights: 2
  },
  reviews: {
    count: 89,
    rating: 4.82
  }
});

// Create 2dsphere index for geospatial queries
db.listings.createIndex({ "location": "2dsphere" });
