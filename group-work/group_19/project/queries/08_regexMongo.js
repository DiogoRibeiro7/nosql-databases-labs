// Pesquisar livros cujo título começa por "Mongo" (regex, case-insensitive)

use("mongo_project");
db.books.find(
  { title: { $regex: "^Mongo", $options: "i" } },
  { _id: 0, title: 1 }
);