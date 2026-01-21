/* eslint-disable no-undef */
// Finds flights within a specific price range.
// Usage: mongosh queries/20_find_flights_by_price_range.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Flights within price range:");

// Define price range
const minPrice = 100;
const maxPrice = 500;

db.flights
  .find({
    price: {
      $gte: minPrice,
      $lte: maxPrice
    },
    status: { $ne: "cancelled" }
  })
  .sort({ price: 1 })
  .limit(20)
  .forEach((doc) => printjson(doc));
