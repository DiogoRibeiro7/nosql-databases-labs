use("healthcare");

db.Patients.insertMany([
  {
    "patientId": "P0001",
    "name": { "first": "Ana", "last": "Silva" },
    "birthDate": "1985-03-10",
    "gender": "F",
    "contacts": {
      "phone": "+351900000001",
      "email": "ana.silva@example.com"
    },
    "addresses": [
      {
        "type": "home",
        "line1": "Rua das Flores 12",
        "city": "Porto",
        "postalCode": "4000-123"
      }
    ]
  },
  {
    "patientId": "P0002",
    "name": { "first": "Bruno", "last": "Ferreira" },
    "birthDate": "1978-11-22",
    "gender": "M",
    "contacts": {
      "phone": "+351900000002",
      "email": "bruno.ferreira@example.com"
    },
    "addresses": [
      {
        "type": "home",
        "line1": "Avenida Central 45",
        "city": "Braga",
        "postalCode": "4700-321"
      }
    ]
  }
]);
