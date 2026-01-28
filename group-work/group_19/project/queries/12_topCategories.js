// Contagem de livros por categoria (Top 10 categorias) com aggregation

use("mongo_project");
db.books.aggregate([
  { $unwind: "$categories" },
  { $group: { _id: "$categories", totalBooks: { $sum: 1 } } },
  { $sort: { totalBooks: -1 } },
  { $limit: 10 },
  { $project: { _id: 0, category: "$_id", totalBooks: 1 } }
]);