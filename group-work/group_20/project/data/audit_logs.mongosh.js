use("healthcare");

db.AuditLogs.insertMany([
  {
    "timestamp": "2024-01-15T10:05:00Z",
    "userId": "admin",
    "action": "READ",
    "resourceType": "Patient",
    "resourceId": "P0001",
    "details": {
      "fieldsAccessed": ["name", "birthDate", "contacts"]
    },
    "ipAddress": "192.168.1.10"
  },
  {
    "timestamp": "2024-02-01T18:45:00Z",
    "userId": "nurse01",
    "action": "CREATE",
    "resourceType": "ClinicalEncounter",
    "resourceId": "E1002",
    "ipAddress": "192.168.1.11"
  }
]);
