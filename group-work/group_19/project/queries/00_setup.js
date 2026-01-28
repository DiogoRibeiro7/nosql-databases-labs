

use("mongo_project");

db.books.createIndex({ categories: 1 });
db.books.createIndex({ authors: 1 });
db.books.createIndex({ publishedDate: -1 });
db.books.createIndex({ categories: 1, publishedDate: -1 });

// Text index (para Q12)
db.books.createIndex(
  { title: "text", shortDescription: "text", longDescription: "text" },
  { name: "books_text" }
);

db.users.createIndex({ email: 1 }, { unique: true });