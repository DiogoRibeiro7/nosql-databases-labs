/* eslint-disable */
/**
 * USE CASE: "Checking room availability"
 * * * User Story:
 * "As a user wants to plan a trip and need to check if the desired listing is available for the input dates."
 * * * Technical Goal:
 * Perform a countDocuments to check if the listing checks out the date conditions. If the listing is returned, the reservation isn´t possible since there is already an existing one with such conditions. It prevents double booking by covering all possible conflict scenarios',
 */
db = db.getSiblingDB("group_05_final");

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
