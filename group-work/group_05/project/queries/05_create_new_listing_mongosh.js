db = db.getSiblingDB("airbnb");

/**
 * USE CASE: "Host Onboarding & Initial Review"
 * * User Story:
 * "As a new host, I want to onboard my property using a single form submission.
 * The system should automatically register me as a host (if I'm new),
 * create the listing record, and initialize the review history."
 */

const formSubmission = {
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", 
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

// Upsert the Host (Ensure Host 1015 exists)
db.hosts.updateOne(
  { id: formSubmission.host_id }, 
  { 
    $set: { 
      id: formSubmission.host_id,
      name: formSubmission.host_name,
      // Add default fields if this is a brand new host
      location: "Porto, Portugal", 
      is_superhost: false 
    } 
  },
  { upsert: true }
);
print(`✅ Host '${formSubmission.host_name}' (ID: ${formSubmission.host_id}) assigned/updated.`);


// Insert the Listing
// We remove 'host_name' to keep the table clean, but add 'location' for the map search.
const listingDoc = {
  ...formSubmission,
  // Add GeoJSON so it appears in the radius search
  location: {
    type: "Point",
    coordinates: [formSubmission.longitude, formSubmission.latitude] 
  }
};
// Remove the denormalized field
delete listingDoc.host_name; 

db.listings.insertOne(listingDoc);
print(`Listing '${listingDoc.name}' created with UUID: ${listingDoc.id}`);


// Create a "Review Listing" (Initial Review)
db.reviews.insertOne({
  id: new ObjectId(),
  listing_id: formSubmission.id, 
  date: new Date().toISOString().split('T')[0],
  reviewer_name: "Airbnb System",
  rating: 5.0,
  comments: "Welcome to the platform! Listing created successfully."
});
print(`Initial review created for Listing: ${formSubmission.id}`);