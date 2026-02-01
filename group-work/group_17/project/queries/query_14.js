db = db.getSiblingDB('group_17_db');

// find theaters by state
db.theaters.find(
    { "location.address.state": "CA" },
    { _id: 0, theaterId: 1, "location.address": 1 }
)