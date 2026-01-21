// Simple find() example: show events hosted in or near the waterfront neighborhoods.
// Usage: mongosh queries/06_events_by_neighborhood.mongosh.js

db = db.getSiblingDB("group_xx_example_final");
print("Events in Ribeira, Foz, or Massarelos (sorted by date):");
db.events
  // Filter by embedded venue neighborhoods and return human-readable fields.
  .find(
    { "venue.neighborhood": { $in: ["Ribeira", "Foz", "Massarelos"] } },
    { _id: 0, eventCode: 1, title: 1, "venue.neighborhood": 1, eventDate: 1, focusAreas: 1 }
  )
  // Chronological ordering makes it easy to add to a calendar.
  .sort({ eventDate: 1 })
  .forEach((doc) => printjson(doc));
