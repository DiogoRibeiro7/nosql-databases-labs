use("healthcare");

db.Providers.insertMany([
  {
    providerId: "PR001",
    name: {
      first: "João",
      last: "Costa",
      title: "Dr."
    },
    specialty: "Cardiologia",
    organization: "Hospital Central do Porto",
    status: "ativo"
  },
  {
    providerId: "PR002",
    name: {
      first: "Marta",
      last: "Ribeiro",
      title: "Dra."
    },
    specialty: "Medicina Interna",
    organization: "Hospital de Braga",
    status: "ativo"
  }
]);
