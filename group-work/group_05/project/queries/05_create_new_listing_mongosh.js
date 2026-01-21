db = db.getSiblingDB("airbnb");

/**
 * USE CASE: "Host Onboarding"
 * * User Story:
 * "As a new host in Porto, I want to add my apartment listing to the platform
 * so that travelers can view its details and book their stay."
 * * Technical Goal:
 * Insert a single document into the 'airbnb_data' collection with
 * structured fields matching the existing schema.
 */

const newListing = {
  "id": crypto.randomUUID(),
  "name": "Sunny Riverside Studio in Porto",
  "host_id": 1015,
  "host_name": "Porto_Host_15",
  "neighbourhood": "Ribeira",
  "latitude": 41.1409,
  "longitude": -8.6110,
  "room_type": "Private room",
  "price": "€65",
  "accommodates": 2,
  "bedrooms": 1,
  "beds": 1,
  "minimum_nights": 1,
  "number_of_reviews": 0,
  "review_scores_rating": 0, 
  "availability_365": 180
};

const insertResult = db.airbnb_data.insertOne(newListing);

print("Listing created with ID: " + insertResult.insertedId);