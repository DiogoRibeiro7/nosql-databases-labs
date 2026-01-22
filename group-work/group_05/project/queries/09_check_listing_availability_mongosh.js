db = db.getSiblingDB("airbnb");

const input = {
  listing_id: 10005,
  y_start: "2026/03/18",
  z_end: "2026/03/21",
};

const conflicts = db.reservations.countDocuments({
  listing_id: input.listing_id,
  "dates.0": { $lt: input.z_end },
  "dates.1": { $gt: input.y_start },
});

if (conflicts) {
  print("Conflict found! There's already a reservation for this listing", conflicts);
} else {
  print("Clear! No overlapping reservations found.");
}
