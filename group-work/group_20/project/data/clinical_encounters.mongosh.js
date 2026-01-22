use("healthcare");

db.ClinicalEncounters.insertMany([
  { encounterId: "E1001", patientId: "P0001", type: "consulta", date: "2024-01-10T10:00:00Z", providerId: "PR001" },
  { encounterId: "E1002", patientId: "P0002", type: "urgencia", date: "2024-01-12T18:30:00Z", providerId: "PR002" },
  { encounterId: "E1003", patientId: "P0003", type: "consulta", date: "2024-01-15T09:00:00Z", providerId: "PR001" },
  { encounterId: "E1004", patientId: "P0004", type: "internamento", date: "2024-01-20T14:00:00Z", providerId: "PR003" },
  { encounterId: "E1005", patientId: "P0005", type: "consulta", date: "2024-01-22T11:00:00Z", providerId: "PR001" },
  { encounterId: "E1006", patientId: "P0006", type: "urgencia", date: "2024-01-25T22:00:00Z", providerId: "PR002" },
  { encounterId: "E1007", patientId: "P0007", type: "consulta", date: "2024-01-28T15:00:00Z", providerId: "PR004" },
  { encounterId: "E1008", patientId: "P0008", type: "consulta", date: "2024-02-01T10:30:00Z", providerId: "PR003" },
  { encounterId: "E1009", patientId: "P0009", type: "urgencia", date: "2024-02-03T19:00:00Z", providerId: "PR002" },
  { encounterId: "E1010", patientId: "P0010", type: "consulta", date: "2024-02-05T08:00:00Z", providerId: "PR004" }
]);
