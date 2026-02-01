

use("mongo_project");

// reset para não duplicar
db.users.deleteMany({});
db.loans.deleteMany({});

db.users.insertMany([
  { _id: 1, name: "Joao", email: "joao@example.com"},
  { _id: 2, name: "Maria", email: "maria@example.com"},
  { _id: 3, name: "Pedro", email: "pedro@example.com"}
]);

// apanhar IDs reais de books (se forem ObjectId, ficam ObjectId; se forem números, ficam números)
const bookIds = [];
db.books.find({}, { _id: 1 }).limit(10).forEach(d => bookIds.push(d._id));

if (bookIds.length < 3) throw new Error("Poucos books. Confirma import do books.json.");

// LOANS
db.loans.insertMany([
  { _id: 1001, userId: 1, bookId: bookIds[0], loanDate: ISODate("2024-01-10T10:00:00Z"), dueDate: ISODate("2024-02-10T10:00:00Z"), status: "LOANED" },
  { _id: 1002, userId: 1, bookId: bookIds[1], loanDate: ISODate("2024-02-12T12:00:00Z"), dueDate: ISODate("2024-03-12T12:00:00Z"), status: "RETURNED", returnedDate: ISODate("2024-03-01T12:00:00Z") },
  { _id: 1003, userId: 2, bookId: bookIds[2], loanDate: ISODate("2024-03-05T09:00:00Z"), dueDate: ISODate("2024-04-05T09:00:00Z"), status: "LOANED" }
]);
