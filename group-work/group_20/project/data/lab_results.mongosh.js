use("healthcare");

db.LabResults.insertMany([
  { labResultId: "L5001", patientId: "P0001", encounterId: "E1001", testType: "Hemograma", collectedAt: "2024-01-10T09:30:00Z" },
  { labResultId: "L5002", patientId: "P0002", encounterId: "E1002", testType: "PCR", collectedAt: "2024-01-12T18:00:00Z" },
  { labResultId: "L5003", patientId: "P0003", encounterId: "E1003", testType: "Glicemia", collectedAt: "2024-01-15T08:30:00Z" },
  { labResultId: "L5004", patientId: "P0004", encounterId: "E1004", testType: "Hemograma", collectedAt: "2024-01-20T13:00:00Z" },
  { labResultId: "L5005", patientId: "P0005", encounterId: "E1005", testType: "Colesterol", collectedAt: "2024-01-22T10:30:00Z" },
  { labResultId: "L5006", patientId: "P0006", encounterId: "E1006", testType: "PCR", collectedAt: "2024-01-25T21:30:00Z" },
  { labResultId: "L5007", patientId: "P0007", encounterId: "E1007", testType: "Hemoglobina", collectedAt: "2024-01-28T14:30:00Z" },
  { labResultId: "L5008", patientId: "P0008", encounterId: "E1008", testType: "Glicemia", collectedAt: "2024-02-01T10:00:00Z" },
  { labResultId: "L5009", patientId: "P0009", encounterId: "E1009", testType: "PCR", collectedAt: "2024-02-03T18:30:00Z" },
  { labResultId: "L5010", patientId: "P0010", encounterId: "E1010", testType: "Hemograma", collectedAt: "2024-02-05T07:30:00Z" }
]);
