use("healthcare");

db.ClinicalEncounters.insertMany([
  {
    "encounterId": "E1001",
    "patientId": "P0001",
    "type": "consulta",
    "date": "2024-01-15T10:00:00Z",
    "providerId": "PR001",
    "reason": "Dor torácica",
    "diagnoses": [
      { "code": "I20", "description": "Angina de peito" }
    ],
    "observations": [
      { "type": "blood_pressure", "value": "130/80", "unit": "mmHg" }
    ]
  },
  {
    "encounterId": "E1002",
    "patientId": "P0002",
    "type": "urgencia",
    "date": "2024-02-01T18:30:00Z",
    "providerId": "PR002",
    "reason": "Febre alta",
    "diagnoses": [
      { "code": "J10", "description": "Gripe" }
    ],
    "observations": [
      { "type": "temperature", "value": 39.2, "unit": "C" }
    ]
  }
]);
