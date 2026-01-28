// Listar livros de um autor específico com campos principais, ordenados por data de publicação decrescente 

use("mongo_project");

db.books.find(
  { authors: "W. Frank Ableson" },
  { _id: 0, title: 1, authors: 1, publishedDate: 1 }
).sort({ publishedDate: -1 });
