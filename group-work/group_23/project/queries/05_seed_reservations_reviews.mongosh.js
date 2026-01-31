// Seed reservations and reviews for demo queries (idempotent).
// Usage: mongosh queries/05_seed_reservations_reviews.mongosh.js

db = db.getSiblingDB("staybook");
print("Seeding reservations + reviews (idempotent):");

const SEED_TAG = "group23_v1";

// Clean previous seed data
db.reviews.deleteMany({ seedTag: SEED_TAG });
db.reservations.deleteMany({ seedTag: SEED_TAG });

// Pick a few listing numeric ids from dataset
const listingIds = db.listings
  .find({}, { id: 1 })
  .limit(6)
  .toArray()
  .map((x) => x.id);

if (listingIds.length < 5) {
  throw new Error("Not enough listings found. Ensure listings are imported into staybook.listings.");
}

// Pick guests
const guests = db.users.find({ roles: "guest" }, { _id: 1 }).limit(3).toArray();
if (guests.length < 3) {
  throw new Error("Need at least 3 guest users. Run 04_seed_users_guests.mongosh.js first.");
}

const now = new Date();

const insertRes = db.reservations.insertMany([
  {
    seedTag: SEED_TAG,
    listingId: listingIds[0],
    guestId: guests[0]._id,
    dateFrom: ISODate("2026-02-10T00:00:00Z"),
    dateTo: ISODate("2026-02-13T00:00:00Z"),
    totalPrice: 3 * 60,
    status: "confirmed",
    createdAt: now,
  },
  {
    seedTag: SEED_TAG,
    listingId: listingIds[1],
    guestId: guests[0]._id,
    dateFrom: ISODate("2026-03-01T00:00:00Z"),
    dateTo: ISODate("2026-03-05T00:00:00Z"),
    totalPrice: 4 * 55,
    status: "cancelled",
    createdAt: now,
  },
  {
    seedTag: SEED_TAG,
    listingId: listingIds[2],
    guestId: guests[1]._id,
    dateFrom: ISODate("2026-01-10T00:00:00Z"),
    dateTo: ISODate("2026-01-12T00:00:00Z"),
    totalPrice: 2 * 40,
    status: "completed",
    createdAt: new Date("2026-01-01T10:00:00Z"),
  },
  {
    seedTag: SEED_TAG,
    listingId: listingIds[3],
    guestId: guests[1]._id,
    dateFrom: ISODate("2026-04-10T00:00:00Z"),
    dateTo: ISODate("2026-04-12T00:00:00Z"),
    totalPrice: 2 * 70,
    status: "pending",
    createdAt: now,
  },
  {
    seedTag: SEED_TAG,
    listingId: listingIds[4],
    guestId: guests[2]._id,
    dateFrom: ISODate("2026-05-10T00:00:00Z"),
    dateTo: ISODate("2026-05-15T00:00:00Z"),
    totalPrice: 5 * 65,
    status: "confirmed",
    createdAt: now,
  },
]);

print("Inserted reservations: " + insertRes.insertedCount);

// Create reviews only for completed reservations created by this seed
const completed = db.reservations.find({ seedTag: SEED_TAG, status: "completed" }).toArray();

for (const r of completed) {
  db.reviews.insertOne({
    seedTag: SEED_TAG,
    reservationId: r._id,
    listingId: r.listingId,
    guestId: r.guestId,
    rating: 5,
    comment: "Very good experience.",
    createdAt: new Date(),
  });
}

print("Reviews inserted for completed seeded reservations: " + completed.length);
print("Seed completed.");
