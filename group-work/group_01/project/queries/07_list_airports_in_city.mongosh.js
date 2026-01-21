/* eslint-disable no-undef */
// Lists all airports in a given municipality.
// Usage: mongosh queries/07_list_airports_in_city.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Airports in Porto:");
db.airports
  .aggregate([
    {
      $match: { municipality: "Porto" }
    },
    {
      $project: { _id: 0, airportIdent: 1, name: 1, country: 1 }
    }
  ])
  .forEach((doc) => printjson(doc));
