// Query 01 (Pacientes por idade e género em Lisboa)
// Uso: mongosh queries/01.mongosh.js

db = db.getSiblingDB("medical_database");

db.patients.aggregate([
    {
        $match: {
            "demographics.gender": "F",
            "demographics.age": { $gte: 18, $lte: 65 },
            "contact.address.city": "Lisboa"
        }
    },
    { $sort: { "demographics.age": -1 }}, // Coloca a idade de forma DESC
    { $limit: 1 }
]).forEach((doc) => printjson(doc));
