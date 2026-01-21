db = db.getSiblingDB("lab_results");
print("List of Patients allergic to Pollen:");
db.patients.aggregate([
  {
    $match: {
      "medical_history.allergies": "Pollen"
    }
  },
  {
    $project: {
      _id: 0,
      "demographics.full_name": 1,
      "medical_history.allergies": 1
    }
  }
]).forEach((doc) => printjson(doc));