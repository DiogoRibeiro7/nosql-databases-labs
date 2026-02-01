// Pesquisa full-text por "mongodb" usando o índice de texto books_text

use("mongo_project");

db.books.find(
  { $text: { $search: "mongodb" } },
  { _id: 0, title: 1, authors: 1, categories: 1 }
).limit(10);