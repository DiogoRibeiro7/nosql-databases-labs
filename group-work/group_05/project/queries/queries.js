// Switch to the database you just created
db = db.getSiblingDB("airbnb");
print(`Using database: ${db.getName()}`);

// Example query
const count = db.airbnb_data.countDocuments();
print(`There are ${count} listings in the collection.`);

// 1. Get the name of all airbnb listings from Porto, only show name and type of room
// Use Case: User wants to get All listings from Porto and see only the name and room type
const portoData = db.airbnb_data.find({ host_name: /^Porto/ }, { name: 1, room_type: 1, _id: 0 });
print("Porto Listings: ", portoData);

// 2. Get the name of all airbnb listings from Lisbon, only show name and type of room
// Use Case: User wants to get All listings from Lisbon and see only the name and room type
const lisbonData = db.airbnb_data.find({ host_name: /^Lisbon/ }, { name: 1, room_type: 1, _id: 0 });
print("Lisbon Listings: ", lisbonData);

// 3. Group by Neighbourhood
// Use Case: User wants to filter all neighbourhoods in Lisbon and listings quantity
const neighbourhoodListings = db.airbnb_data.aggregate([
  { $match: { host_name: /^Lisbon/ } },
  {
    $group: {
      _id: null,
      unique_neighbourhoods: { $addToSet: "$neighbourhood" },
      total_listings: { $count: {} },
    },
  },
  { $project: { _id: 0, unique_neighbourhoods: 1, total_listings: 1 } },
]);
print("Unique neighbourhoods in lisbon: ", neighbourhoodListings);

// 4. Get All
// Use Case: User wants to filter all listings within 1km from avenida dos aliados (porto)

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
const lat = 41.148831;
const long = -8.610403;
db.airbnb_data.createIndex({ location: "2dsphere" });
const geospatial = db.airbnb_data.find(
  {
    location: {
      $near: { $geometry: { type: "Point", coordinates: [long, lat] }, $maxDistance: 1000 },
    },
  },
  { name: 1, neighbourhood: 1, room_type: 1, price: 1, _id: 0 }
);
print("All listings within 1km from avenida dos aliados: ", geospatial);
