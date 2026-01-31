db = db.getSiblingDB("lab_results");

print("Starting Index Creation (Top 5 Only)...");
print("--- Indexing 'patients' ---");
db.patients.createIndex({ "patient_id": 1 });
db.patients.createIndex({ "demographics.blood_type": 1 });
db.patients.createIndex({ "insurance.effective_date": 1 });
db.patients.createIndex({ "insurance.provider": 1 });

print("--- Indexing 'visits' ---");
db.visits.createIndex({ "patient_id": 1 });
db.visits.createIndex({ "symptoms": 1 });

print("--- Indexing 'results' ---");
db.results.createIndex({ "patient_id": 1 });
db.results.createIndex({ "notes": "text" });
print("SUCCESS: Indexes for Top 5 Queries created!");