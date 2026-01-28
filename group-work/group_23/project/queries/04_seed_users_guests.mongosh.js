// 04_seed_users_guests.mongosh.js
use("staybook");

// Keep host users you already have. Add guest users for reservations.
db.users.insertMany([
  {
    name: "Guest One",
    email: "guest.one@example.com",
    roles: ["guest"],
    status: "active",
    createdAt: new Date("2026-01-02T10:00:00Z")
  },
  {
    name: "Guest Two",
    email: "guest.two@example.com",
    roles: ["guest"],
    status: "active",
    createdAt: new Date("2026-01-03T10:00:00Z")
  },
  {
    name: "Guest Three",
    email: "guest.three@example.com",
    roles: ["guest"],
    status: "active",
    createdAt: new Date("2026-01-04T10:00:00Z")
  }
]);

print("Guest users inserted.");
