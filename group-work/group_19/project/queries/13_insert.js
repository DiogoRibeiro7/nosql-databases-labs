// Inserir um novo empréstimo na coleção loans associado a um bookId válido

use("mongo_project");

const anyBook = db.books.findOne({}, { _id: 1 });

db.loans.insertOne({
  _id: 9001,
  userId: 1,
  bookId: anyBook._id,
  loanDate: ISODate("2026-01-21T10:00:00Z"),
  dueDate: ISODate("2026-01-22T10:00:00Z"),
  status: "LOANED"
});
