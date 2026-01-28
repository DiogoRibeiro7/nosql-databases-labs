// Import Airbnb datasets into the staybook database
// Execute with: mongosh import_data.mongosh.js

use("staybook");

// NOTE:
// The Airbnb datasets are imported using MongoDB Compass.
// This script assumes the `listings` collection already exists
// after importing:
// - sample_porto_listings.json
// - sample_lisbon_listings.json

print("Database:", db.getName());
print("Collections:", db.getCollectionNames());

// Create additional collections if they do not exist
db.createCollection("users");
db.createCollection("reservations");
db.createCollection("reviews");

print("Setup completed.");
