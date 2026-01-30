use("healthcare");

db.ClinicalEncounters.insertMany([
  {
    encounterId: "E1001",
    patientId: "P0001",
    providerId: "PR001",
    type: "consulta",
    date: new Date("2024-01-10T10:00:00Z"),
    diagnoses: [
      { code: "I10", description: "Hipertensão arterial" }
    ],
    observations: [
      { type: "blood_pressure", value: "130/85" },
      { type: "temperature", value: 36.8 }
    ]
  },
  {
    encounterId: "E1002",
    patientId: "P0002",
    providerId: "PR002",
    type: "urgencia",
    date: new Date("2024-01-12T18:30:00Z"),
    diagnoses: [
      { code: "J18", description: "Pneumonia" }
    ],
    observations: [
      { type: "temperature", value: 38.5 }
    ]
  },
  {
    encounterId: "E1003",
    patientId: "P0003",
    providerId: "PR001",
    type: "consulta",
    date: new Date("2024-01-15T09:00:00Z"),
    diagnoses: [
      { code: "E11", description: "Diabetes tipo 2" }
    ],
    observations: [
      { type: "glicemia", value: 180 }
    ]
  }
]);
