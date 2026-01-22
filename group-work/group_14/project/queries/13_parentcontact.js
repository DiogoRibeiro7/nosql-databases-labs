db = db.getSiblingDB("lab_results");
print("Patients with Parent as Emergency Contact:");
db.patients.aggregate([
  {
    $match: {
      "contact.emergency_contact.relationship": "Parent"
    }
  },
  {
    $project: {
      _id: 0,
      Name: "$demographics.full_name",
      EmergencyContact: "$contact.emergency_contact.name",
      Relationship: "$contact.emergency_contact.relationship"
    }
  }
]).forEach((doc) => printjson(doc));