use("healthcare");

db.Providers.insertMany([
  {
    "providerId": "PR001",
    "name": "Dr. João Costa",
    "specialty": "Cardiologia",
    "organization": "Hospital Central do Porto"
  },
  {
    "providerId": "PR002",
    "name": "Dra. Marta Ribeiro",
    "specialty": "Medicina Interna",
    "organization": "Hospital de Braga"
  }
]);

