/* eslint-disable no-undef */
// Recreates the recommended indexes.
// Run with: mongosh queries/index_blueprint.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print(`Using database: ${db.getName()}`);

print("Applying unique indexes for reference data...");
// Uniqueness on airline IATA (sparse to allow multiple null values)
printjson(db.airlines.createIndex({ airlineIata: 1 }, { unique: true, sparse: true }));
// Uniqueness on airport identifier (sparse to allow multiple null values)
printjson(db.airports.createIndex({ airportIdent: 1 }, { unique: true, sparse: true }));
// Uniqueness on user email
printjson(db.users.createIndex({ email: 1 }, { unique: true }));

print("\nApplying indexes on flights...");
// Compound index for route and date queries
printjson(db.flights.createIndex({ departureAirportIdent: 1, arrivalAirportIdent: 1, departureTime: 1 }));
// Index for flight number lookups
printjson(db.flights.createIndex({ flightNumber: 1 }));
// Index for airline IATA
printjson(db.flights.createIndex({ airlineIata: 1 }));
// Index for status
printjson(db.flights.createIndex({ status: 1 }));

print("\nApplying indexes on reservations...");
// Index for user ID
printjson(db.reservations.createIndex({ userId: 1 }));
// Index for flight number
printjson(db.reservations.createIndex({ flightNumber: 1 }));
// Compound index for flight number and status
printjson(db.reservations.createIndex({ flightNumber: 1, status: 1 }));
// Index for flight ID
printjson(db.reservations.createIndex({ flightId: 1 }));

print("\nDone. Run db.<collection>.getIndexes() to inspect the results.");
