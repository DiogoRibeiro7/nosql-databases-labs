// Listar livros publicados entre 2010 e 2014 ordenados por data de publicação decrescente

use("mongo_project");
db.books.find(
  {
    publishedDate: {
      $exists: true,
      $gte: ISODate("2010-01-01T00:00:00Z"),
      $lt: ISODate("2015-01-01T00:00:00Z")
    }
  },
  { _id: 0, title: 1, publishedDate: 1, categories: 1 }
).sort({ publishedDate: -1 })   
