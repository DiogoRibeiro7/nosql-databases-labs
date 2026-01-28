// Paginação de livros da categoria "Java" ordenados por título


use("mongo_project");

const page = 2;
const size = 10;

db.books.find(
  { categories: "Java" },
  { _id: 0, title: 1, shortDescription: 1, pageCount: 1 }
).sort({ title: 1 }).skip((page - 1) * size).limit(size);