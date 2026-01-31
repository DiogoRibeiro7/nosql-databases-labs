// Listar livros da categoria "Mobile" com título, categorias e autores

use("mongo_project");
db.books.find(
  { categories: "Mobile" },
  { _id: 0, title: 1, categories: 1, authors: 1 }
)
