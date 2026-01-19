
db = db.getSiblingDB("group_10_db");

db.rentals.find(
  { customerId: "CUST-001" },
  { rentalDate: 1, status: 1, films: 1 }
).sort({ rentalDate: -1 });
