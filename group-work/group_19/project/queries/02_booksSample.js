// Listar uma amostra de livros com os seus campos principais

use("mongo_project");
db.books.find(
  {},
  { _id: 0, title: 1, authors: 1, categories: 1, pageCount: 1, publishedDate: 1 }
).limit(5);
