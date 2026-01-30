/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Checking room availability"
 * * * User Story:
 * "As a user, I want to plan a trip and need to check if the desired listing
 * is available for my specific dates before I attempt to book."
 * * * Technical Goal:
 * Prevent Double Bookings. We perform a countDocuments() to see if ANY existing
 * reservation overlaps with the requested range.
 * Logic: An overlap exists if (RequestStart < ExistingEnd) AND (RequestEnd > ExistingStart).
 */

function checkAvailability(listingId, requestStart, requestEnd) {
  print(`\n--- Checking Availability for Listing ${listingId} ---`);
  print(`Requested: ${requestStart} to ${requestEnd}`);

  const conflictCount = db.reservations.countDocuments({
    listing_id: listingId,
    // Existing reservation starts BEFORE request ends
    "dates.0": { $lt: requestEnd },
    // Existing reservation ends AFTER request starts
    "dates.1": { $gt: requestStart },
  });

  if (conflictCount > 0) {
    print(`UNAVAILABLE: Found ${conflictCount} conflicting reservation(s).`);
  } else {
    print("AVAILABLE: No overlapping reservations found. You can book!");
  }
}

// --- TEST PARAMETERS ---
const LISTING_ID = 10005;

// Scenario 1: A date range that likely conflicts
checkAvailability(LISTING_ID, "2026-03-18", "2026-03-21");

// Scenario 2: A date range far in the future
checkAvailability(LISTING_ID, "2027-01-01", "2027-01-05");
