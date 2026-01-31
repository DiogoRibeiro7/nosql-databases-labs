// Query 10: create indexes to speed common department and condition queries.
load("group-work/group_06/project/queries/ensure_medical_db.mongosh.js");

// Ensure department + date queries run faster by using a compound index for match + sort.
const visitsIndex = db.visits.createIndex({ department: 1, visit_date: -1 });
print("Índice criado:", visitsIndex);

// Accelerate chronic condition lookups common in analytics dashboards.
const chronicIndex = db.patients.createIndex({ "medical_history.chronic_conditions": 1 });
print("Índice criado:", chronicIndex);
