// Listar livros com mais de 500 páginas da categoria "Java"

use("mongo_project");
db.books.find(
  { categories:"Java", pageCount: { $gt: 500 } },
  { _id: 0, title: 1, categories: 1, pageCount: 1 }
).sort({ pageCount: -1 });