// Análise do plano de execução (explain) para livros da categoria "Mobile"

use("mongo_project");

db.books.find(
  { categories: "Mobile" },
  { _id: 0, title: 1, publishedDate: 1 }
).sort({ publishedDate: -1 })
 .explain();