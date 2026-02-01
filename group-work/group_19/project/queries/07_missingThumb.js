// Detetar livros com thumbnailUrl ausente ou inválido

use("mongo_project");

db.books.find(
  {
    $or: [
      { thumbnailUrl: { $exists: false } },
      { thumbnailUrl: null },
      { thumbnailUrl: "" }
    ]
  },
  { _id: 0, title: 1 }
).limit(10);