// Data quality & validation checks for staybook.
// Usage: mongosh tests/data_quality.mongosh.js

db = db.getSiblingDB("staybook");

print("=== Staybook Data Quality Checks ===");

let FAILS = 0;
function ok(msg) {
  print("✅ " + msg);
}
function fail(msg) {
  FAILS++;
  print("❌ " + msg);
}
function assertZero(label, value) {
  if (value === 0) ok(label + " (0)");
  else fail(label + " (" + value + ")");
}
function assertAtLeastOne(label, value) {
  if (value > 0) ok(label + " (" + value + ")");
  else fail(label + " (" + value + ")");
}

// ---------- 0) Basic presence ----------
const counts = {
  listings: db.listings.countDocuments(),
  users: db.users.countDocuments(),
  reservations: db.reservations.countDocuments(),
  reviews: db.reviews.countDocuments(),
};

print("\n-- Collection counts --");
printjson(counts);

assertAtLeastOne("listings collection is not empty", counts.listings);
assertAtLeastOne("users collection is not empty", counts.users);
// reservations/reviews may be seed-based; still useful to have at least one if you seeded
if (counts.reservations === 0) print("ℹ️ reservations is empty (seed may not have been executed yet).");
if (counts.reviews === 0) print("ℹ️ reviews is empty (seed may not have been executed yet).");

// ---------- 1) Listings: required fields & types ----------
print("\n-- Listings checks --");

// Missing required fields (id, name, neighbourhood, room_type)
const listingsMissingCore = db.listings.countDocuments({
  $or: [
    { id: { $exists: false } },
    { name: { $exists: false } },
    { neighbourhood: { $exists: false } },
    { room_type: { $exists: false } },
  ],
});
assertZero("listings missing core fields (id/name/neighbourhood/room_type)", listingsMissingCore);

// id type numeric
const listingsBadIdType = db.listings.countDocuments({ id: { $not: { $type: "number" } } });
assertZero("listings with non-numeric id", listingsBadIdType);

// price_eur type numeric if exists
const listingsBadPriceType = db.listings.countDocuments({
  price_eur: { $exists: true, $not: { $type: "number" } },
});
assertZero("listings with price_eur present but not numeric", listingsBadPriceType);

// ---------- 2) Users: required fields & basic validity ----------
print("\n-- Users checks --");

// required fields
const usersMissingCore = db.users.countDocuments({
  $or: [{ name: { $exists: false } }, { email: { $exists: false } }, { roles: { $exists: false } }],
});
assertZero("users missing core fields (name/email/roles)", usersMissingCore);

// email basic format (lightweight check)
const usersBadEmail = db.users.countDocuments({
  email: { $exists: true, $not: /.+@.+\..+/ },
});
assertZero("users with invalid email format", usersBadEmail);

// roles must be array
const usersRolesNotArray = db.users.countDocuments({ roles: { $exists: true, $not: { $type: "array" } } });
assertZero("users with roles not an array", usersRolesNotArray);

// ---------- 3) Reservations: referential integrity + date logic ----------
print("\n-- Reservations checks --");

// Only run deeper checks if there is data
if (counts.reservations > 0) {
  // listingId must exist in listings.id
  const reservationsWithMissingListing = db.reservations.aggregate([
    {
      $lookup: {
        from: "listings",
        localField: "listingId",
        foreignField: "id",
        as: "listing",
      },
    },
    { $match: { listing: { $eq: [] } } },
    { $count: "bad" },
  ]).toArray();
  const badListingRef = reservationsWithMissingListing[0]?.bad ?? 0;
  assertZero("reservations with listingId not found in listings", badListingRef);

  // guestId must exist in users._id
  const reservationsWithMissingGuest = db.reservations.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "guestId",
        foreignField: "_id",
        as: "guest",
      },
    },
    { $match: { guest: { $eq: [] } } },
    { $count: "bad" },
  ]).toArray();
  const badGuestRef = reservationsWithMissingGuest[0]?.bad ?? 0;
  assertZero("reservations with guestId not found in users", badGuestRef);

  // dateFrom < dateTo (strict)
  const badDateRanges = db.reservations.countDocuments({
    $expr: { $gte: ["$dateFrom", "$dateTo"] },
  });
  assertZero("reservations with invalid date range (dateFrom >= dateTo)", badDateRanges);

  // totalPrice non-negative if present
  const badTotalPrice = db.reservations.countDocuments({
    totalPrice: { $exists: true, $type: "number", $lt: 0 },
  });
  assertZero("reservations with negative totalPrice", badTotalPrice);

  // status allowed set
  const badStatus = db.reservations.countDocuments({
    status: { $exists: true, $nin: ["pending", "confirmed", "completed", "cancelled"] },
  });
  assertZero("reservations with invalid status", badStatus);
} else {
  print("ℹ️ Skipping reservation integrity checks (no reservations).");
}

// ---------- 4) Reviews: referential integrity ----------
print("\n-- Reviews checks --");

if (counts.reviews > 0) {
  // reservationId must exist in reservations._id
  const reviewsWithMissingReservation = db.reviews.aggregate([
    {
      $lookup: {
        from: "reservations",
        localField: "reservationId",
        foreignField: "_id",
        as: "res",
      },
    },
    { $match: { res: { $eq: [] } } },
    { $count: "bad" },
  ]).toArray();
  const badReservationRef = reviewsWithMissingReservation[0]?.bad ?? 0;
  assertZero("reviews with reservationId not found in reservations", badReservationRef);

  // rating range check if numeric
  const badRating = db.reviews.countDocuments({
    rating: { $exists: true, $type: "number", $not: { $gte: 1, $lte: 5 } },
  });
  assertZero("reviews with rating outside 1..5", badRating);
} else {
  print("ℹ️ Skipping review integrity checks (no reviews).");
}

// ---------- Summary ----------
print("\n=== Summary ===");
if (FAILS === 0) {
  print("✅ All data quality checks passed.");
} else {
  print("❌ Data quality checks failed: " + FAILS);
  print("Fix the failing constraints and re-run this script.");
}
