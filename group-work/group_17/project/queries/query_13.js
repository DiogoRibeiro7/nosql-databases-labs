db = db.getSiblingDB('group_17_db');

// add a new theater
db.theaters.insertOne({
  theaterId: 1001,
  location: {
    address: {
      street1: "123 Main St",
      city: "Los Angeles",
      state: "CA",
      zipcode: "90001"
    },
    geo: {
      type: "Point",
      coordinates: [-118.24368, 34.05223]
    }
  }
});