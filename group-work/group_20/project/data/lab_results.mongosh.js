use("healthcare");

db.LabResults.insertMany([
  {
    labResultId: "L5001",
    patientId: "P0001",
    encounterId: "E1001",
    testType: "Hemograma",
    collectedAt: new Date("2024-01-10T09:30:00Z"),
    results: [
      { parameter: "Hemoglobina", value: 14.2, unit: "g/dL" },
      { parameter: "Leucócitos", value: 7200, unit: "células/µL" }
    ]
  },
  {
    labResultId: "L5002",
    patientId: "P0002",
    encounterId: "E1002",
    testType: "PCR",
    collectedAt: new Date("2024-01-12T18:00:00Z"),
    results: [
      { parameter: "Proteína C Reativa", value: 12.5, unit: "mg/L" }
    ]
  },
  {
    labResultId: "L5003",
    patientId: "P0003",
    encounterId: "E1003",
    testType: "Glicemia",
    collectedAt: new Date("2024-01-15T08:30:00Z"),
    results: [
      { parameter: "Glicose", value: 185, unit: "mg/dL" }
    ]
  }
]);
