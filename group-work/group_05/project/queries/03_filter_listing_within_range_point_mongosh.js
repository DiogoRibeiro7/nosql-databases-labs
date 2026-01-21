// Switch to the airbnb database
db = db.getSiblingDB("airbnb");
print(`Using database: ${db.getName()}`);

/**
 * USE CASE: "Central Group Hotel Search"
 * * User Story:
 * "As a travel agent booking for a family of 4+, I need to find 'Hotel room'
 * style listings located within a 5km radius of the city center (Avenida dos Aliados),
 * ensuring they are close to the main tourist attractions."
 * * * Technical Goal:
 * Perform a schema migration to construct valid GeoJSON Point objects from raw
 * coordinates, create a '2dsphere' index to support spatial queries, and execute
 * a proximity search ($near) combined with scalar filters.
 */

// Update documents to use correct geojson format
db.airbnb_data.updateMany({}, [
  {
    $set: {
      location: {
        type: "Point",
        coordinates: ["$longitude", "$latitude"],
      },
    },
  },
]);

const centerPoint = [-8.610403, 41.148831]; // Coordinates for Avenida dos Aliados

// Get all hotel rooms within 5km of avenida dos aliados that accommodate at least 4 people
db.airbnb_data.createIndex({ location: "2dsphere" });

const geospatial = db.airbnb_data.find(
  {
    accommodates: { $gte: 4 },
    room_type: { $eq: "Hotel room" },
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: centerPoint },
        $maxDistance: 5000, // 5000 meters = 5km
      },
    },
  },
  {
    name: 1,
    neighbourhood: 1,
    room_type: 1,
    price: 1,
    review_scores_rating: 1,
    number_of_reviews: 1,
    beds: 1,
    accommodates: 1,
    _id: 0,
  }
);

print("All listings within 5km from avenida dos aliados: ", geospatial);
