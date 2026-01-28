db = db.getSiblingDB("group_10_db");

db.films.find({ rentalRate: { $lte: 3.00 } });
