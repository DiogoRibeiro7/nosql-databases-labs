use("healthcare");

db.LabResults.insertMany([
  {
    "labResultId": "L5001",
    "patientId": "P0001",
    "encounterId": "E1001",
    "testType": "Hemograma",
    "collectedAt": "2024-01-15T09:30:00Z",
    "results": [
      { "parameter": "Hemoglobina", "value": 13.5, "unit": "g/dL", "referenceRange": "12–16" },
      { "parameter": "Leucócitos", "value": 6.2, "unit": "10^9/L", "referenceRange": "4–11" }
    ]
  },
  {
    "labResultId": "L5002",
    "patientId": "P0002",
    "encounterId": "E1002",
    "testType": "PCR",
    "collectedAt": "2024-02-01T19:00:00Z",
    "results": [
      { "parameter": "PCR", "value": 12.4, "unit": "mg/L", "referenceRange": "< 5" }
    ]
  }
]);
