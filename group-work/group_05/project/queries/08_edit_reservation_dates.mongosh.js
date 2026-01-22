/* eslint-disable */
/**
 * USE CASE: "Chenging reservation dates"
 * * * User Story:
 * "As a user had a last minute chenge of plans and requests a change of reservation dates."
 * * * Technical Goal:
 * Perform a update by reservation id to $set new reservation dates',
 */
db = db.getSiblingDB("group_05_final");

const reservationDates = {
  reservation_id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
  user_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b4dnb6d",
  dates: ["2026/04/15", "2026/04/25"],
};

const updateReservation = db.reservations.updateOne(
  { id: reservationDates.reservation_id },
  { $set: { dates: reservationDates.dates } }
);

print(updateReservation);
