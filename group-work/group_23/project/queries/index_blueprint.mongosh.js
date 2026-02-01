// Index blueprint aligned with query patterns (filters, joins, availability checks).
// Usage: mongosh queries/index_blueprint.mongosh.js

db = db.getSiblingDB("staybook");
print("Creating indexes (idempotent):");

// listings: ensure dataset identifier is unique
db.listings.createIndex({ id: 1 }, { unique: true });

// listings: common filters
db.listings.createIndex({ neighbourhood: 1 });
db.listings.createIndex({ room_type: 1 });
db.listings.createIndex({ accommodates: 1 });
db.listings.createIndex({ price_eur: 1 });
db.listings.createIndex({ host_id: 1 });



// reservations: availability + user history
db.reservations.createIndex({ listingId: 1, dateFrom: 1, dateTo: 1, status: 1 });
db.reservations.createIndex({ guestId: 1, createdAt: -1 });

// reviews: one review per reservation + listing timeline
db.reviews.createIndex({ reservationId: 1 }, { unique: true });
db.reviews.createIndex({ listingId: 1, createdAt: -1 });

db.listings.createIndex({ accommodates: 1, price_eur: 1 });
db.reservations.createIndex({ listingId: 1, status: 1, dateFrom: 1, dateTo: 1 });


print("Indexes ready.");
