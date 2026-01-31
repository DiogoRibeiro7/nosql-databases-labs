use("healthcare");

db.AuditLogs.insertMany([
  {
    timestamp: new Date("2024-01-15T10:05:00Z"),
    userId: "admin",
    action: "READ",
    resourceType: "Patient",
    resourceId: "P0001",
    details: {
      fieldsAccessed: ["name", "birthDate", "contacts"]
    },
    metadata: {
      ipAddress: "192.168.1.10"
    }
  },
  {
    timestamp: new Date("2024-02-01T18:45:00Z"),
    userId: "nurse01",
    action: "CREATE",
    resourceType: "ClinicalEncounter",
    resourceId: "E1002",
    metadata: {
      ipAddress: "192.168.1.11"
    }
  }
]);
