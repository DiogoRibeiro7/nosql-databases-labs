/* eslint-disable no-undef */
// Flight Reservation System - Group 01 Project (mongosh only)
// Run from group-work/group_01/project with:
//   mongosh import_data.mongosh.js

// Switch to a dedicated database so the project remains isolated from other labs.
db = db.getSiblingDB("group_01_flight_management_system_final");
print(`Using database: ${db.getName()}`);

// Reset the database before every run so inserts remain idempotent.
print("Dropping previous data (if any)...");
db.dropDatabase();

// Load data from JSON files ----------------------------------------------------
print("\nLoading data from JSON files...");

const fs = require("fs");

// Helper function to load and parse JSON files
function loadJSONFile(filePath) {
  const jsonContent = fs.readFileSync(filePath, "utf8");
  return JSON.parse(jsonContent);
}

// Load reference data
const airlinesRaw = loadJSONFile("data/airlines.json");
const airports = loadJSONFile("data/airports.json");
const countries = loadJSONFile("data/countries.json");
const users = loadJSONFile("data/users.json");

// Remove duplicate airlines by IATA code (keep first occurrence)
const seenIata = new Set();
const airlines = airlinesRaw.filter((airline) => {
  if (!airline.iata || seenIata.has(airline.iata)) {
    return false;
  }
  seenIata.add(airline.iata);
  return true;
});

// Load fact data
const flightsRaw = loadJSONFile("data/flights.json");
const reservationsRaw = loadJSONFile("data/reservations.json");

// Convert date strings to Date objects for flights
const flights = flightsRaw.map((flight) => ({
  ...flight,
  departureTime: new Date(flight.departureTime),
  arrivalTime: new Date(flight.arrivalTime),
}));

// Insert data ----------------------------------------------------------------
print("\nImporting reference data...");
db.airlines.insertMany(airlines);
db.airports.insertMany(airports);
db.countries.insertMany(countries);
const userInsertResult = db.users.insertMany(users);

// Create email to userId map for populating reservations
print("Creating email to userId mapping...");
const emailToUserIdMap = {};
users.forEach((user, index) => {
  emailToUserIdMap[user.email] = userInsertResult.insertedIds[index];
});

// Transform reservations: populate userId from userEmail, remove userEmail
print("Populating userId in reservations...");
const reservations = reservationsRaw.map((reservation) => {
  const { userEmail, ...rest } = reservation;
  const userId = emailToUserIdMap[userEmail] || null;
  return {
    ...rest,
    userId: userId
  };
});

print("Importing fact data...");
db.flights.insertMany(flights);
db.reservations.insertMany(reservations);

// Quick smoke-test to ensure documents landed correctly.
print("\nVerifying counts...");
printjson({
  airlines: db.airlines.countDocuments(),
  airports: db.airports.countDocuments(),
  countries: db.countries.countDocuments(),
  users: db.users.countDocuments(),
  flights: db.flights.countDocuments(),
  reservations: db.reservations.countDocuments(),
});

print("\n=================================");
print("Database setup completed!");
print("Next: load('queries/01_create_flight_reservation.mongosh.js')");
print("=================================");
