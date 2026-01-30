/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Host Onboarding & Initial Review"
 * * User Story:
 * "As a new host, I want to onboard my property using a single form submission.
 * The system should automatically register me as a host (if I'm new),
 * create the listing record, and initialize the review history."
 */

function onboardNewListing(formData) {
  print(`\n--- Processing Onboarding for: ${formData.name} ---`);

  // Upsert the Host
  const hostResult = db.hosts.updateOne(
    { id: formData.host_id },
    {
      $set: {
        id: formData.host_id,
        name: formData.host_name,
        location: "Porto, Portugal",
        is_superhost: false,
      },
    },
    { upsert: true }
  );

  if (hostResult.upsertedCount > 0) {
    print(`New Host created (ID: ${formData.host_id})`);
  } else {
    print(`Existing Host updated (ID: ${formData.host_id})`);
  }

  // Insert the Listing
  const listingDoc = {
    id: formData.id,
    host_id: formData.host_id,
    name: formData.name,
    neighbourhood: formData.neighbourhood,
    location: {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    },
    latitude: formData.latitude,
    longitude: formData.longitude,
    room_type: formData.room_type,
    price: formData.price,
    accommodates: formData.accommodates,
    bedrooms: formData.bedrooms,
    beds: formData.beds,
    minimum_nights: formData.minimum_nights,
    number_of_reviews: 0,
    review_scores_rating: 0,
    availability_365: formData.availability_365,
  };

  db.listings.insertOne(listingDoc);
  print(`Listing created: '${listingDoc.name}' (Price: €${listingDoc.price})`);

  // Insert Initial System Review
  db.reviews.insertOne({
    id: new ObjectId(),
    listing_id: formData.id,
    date: new Date().toISOString().split("T")[0],
    reviewer_name: "Airbnb System",
    rating: 5.0,
    comments: "Welcome to the platform! Listing created successfully.",
  });
  print(`Initial system review added.`);
}

const newListingForm = {
  id: crypto.randomUUID(),
  name: "Sunny Riverside Studio in Porto",
  host_id: 1015,
  host_name: "Porto_Host_15",
  neighbourhood: "Ribeira",
  latitude: 41.1409,
  longitude: -8.611,
  room_type: "Private room",
  price: 65,
  accommodates: 2,
  bedrooms: 1,
  beds: 1,
  minimum_nights: 1,
  availability_365: 180,
};

onboardNewListing(newListingForm);
