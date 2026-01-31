// Medical Records MongoDB Schema
// ================================

// 1. Patients Collection - Complete patient profile
db.patients.createIndex({ "patient_id": 1 }, { unique: true });
db.patients.createIndex({ "health_number": 1 }, { unique: true });
db.patients.createIndex({ "demographics.last_name": 1, "demographics.first_name": 1 });
db.patients.createIndex({ "contact.address.city": 1 });
db.patients.createIndex({ "medical_history.chronic_conditions": 1 });

// 2. Visits Collection - Medical encounters
db.visits.createIndex({ "visit_id": 1 }, { unique: true });
db.visits.createIndex({ "patient_id": 1, "visit_date": -1 });
db.visits.createIndex({ "department": 1 });
db.visits.createIndex({ "diagnosis.code": 1 });

// 3. Lab Results Collection - Test results
db.lab_results.createIndex({ "result_id": 1 }, { unique: true });
db.lab_results.createIndex({ "patient_id": 1, "test_date": -1 });
db.lab_results.createIndex({ "test_code": 1 });
db.lab_results.createIndex({ "abnormal_flag": 1 });

// Example Aggregation: Patient Summary
db.patients.aggregate([
  { $match: { "patient_id": "PT000001" } },
  {
    $lookup: {
      from: "visits",
      localField: "patient_id",
      foreignField: "patient_id",
      as: "recent_visits"
    }
  },
  {
    $lookup: {
      from: "lab_results",
      localField: "patient_id",
      foreignField: "patient_id",
      as: "recent_labs"
    }
  },
  {
    $project: {
      patient_id: 1,
      demographics: 1,
      "medical_history.chronic_conditions": 1,
      "medical_history.current_medications": 1,
      last_visit: { $arrayElemAt: ["$recent_visits", -1] },
      abnormal_labs: {
        $filter: {
          input: "$recent_labs",
          as: "lab",
          cond: { $eq: ["$$lab.abnormal_flag", "H"] }
        }
      }
    }
  }
]);

// High-Risk Patients Query
db.patients.find({
  $and: [
    { "demographics.age": { $gte: 65 } },
    { "medical_history.chronic_conditions": { $size: { $gte: 3 } } }
  ]
});
