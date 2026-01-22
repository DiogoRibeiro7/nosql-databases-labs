use("healthcare");

db.Patients.insertMany([
  { patientId: "P0001", name: { first: "Ana", last: "Silva" }, birthDate: "1985-03-10", gender: "F" },
  { patientId: "P0002", name: { first: "Bruno", last: "Ferreira" }, birthDate: "1978-11-22", gender: "M" },
  { patientId: "P0003", name: { first: "Carla", last: "Mendes" }, birthDate: "1992-07-14", gender: "F" },
  { patientId: "P0004", name: { first: "Daniel", last: "Santos" }, birthDate: "1969-02-05", gender: "M" },
  { patientId: "P0005", name: { first: "Eduarda", last: "Costa" }, birthDate: "2001-09-30", gender: "F" },
  { patientId: "P0006", name: { first: "Fábio", last: "Pereira" }, birthDate: "1999-12-11", gender: "M" },
  { patientId: "P0007", name: { first: "Gabriela", last: "Lopes" }, birthDate: "1988-04-22", gender: "F" },
  { patientId: "P0008", name: { first: "Hugo", last: "Martins" }, birthDate: "1975-01-19", gender: "M" },
  { patientId: "P0009", name: { first: "Inês", last: "Ribeiro" }, birthDate: "1995-06-03", gender: "F" },
  { patientId: "P0010", name: { first: "João", last: "Carvalho" }, birthDate: "1982-08-27", gender: "M" }
].forEach(doc => { insertIfNotExists("Patients", { patientId: doc.patientId }, doc); }));