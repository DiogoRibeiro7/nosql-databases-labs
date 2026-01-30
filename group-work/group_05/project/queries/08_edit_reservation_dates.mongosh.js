/* eslint-disable */
db = db.getSiblingDB("group_05_final");

/**
 * USE CASE: "Changing reservation dates"
 * * * User Story:
 * "As a user who had a last-minute change of plans, I need to request
 * a change of reservation dates for my existing booking."
 * * * Technical Goal:
 * Perform an atomic update ($set) on the 'dates' array for a specific
 * reservation ID.
 */

// Function to handle the update logic
function modifyReservationDates(reservationId, newDates) {
  print(`\n--- Updating Reservation: ${reservationId} ---`);

  const result = db.reservations.updateOne({ id: reservationId }, { $set: { dates: newDates } });

  // robust output handling
  if (result.matchedCount === 0) {
    print("Error: Reservation ID not found.");
  } else if (result.modifiedCount > 0) {
    print("Success: Dates updated successfully.");
    print(`New Dates: ${JSON.stringify(newDates)}`);
  } else {
    print("Notice: No changes made (Dates were already identical).");
  }
}

const TEST_RESERVATION_ID = "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a";
const NEW_DATE_RANGE = ["2026-04-15", "2026-04-25"];

modifyReservationDates(TEST_RESERVATION_ID, NEW_DATE_RANGE);
