// Atualizar o estado de um empréstimo para "RETURNED"


use("mongo_project");

db.loans.updateOne(
  { _id: 1001 },
  { $set: { status: "RETURNED", returnedDate: ISODate("2024-11-20T10:00:00Z") } }
);
