// Comparação de desempenho antes e depois de criar um índice para encontrar livros de categoria Java

use("mongo_project");

// 1) Drop do index caso já exista
try { db.books.dropIndex({ categories: 1, publishedDate: -1 }); } catch (e) {}

// 2) BEFORE: EXPLAIN da consulta
const beforeExplain = db.books
  .find({ categories: "Java" })
  .sort({ publishedDate: -1 })
  .limit(10)
  .explain("executionStats");

const simplifiedBefore = {
  totalDocsExamined: beforeExplain.executionStats.totalDocsExamined,
  totalKeysExamined: beforeExplain.executionStats.totalKeysExamined,
  executionTimeMillis: beforeExplain.executionStats.executionTimeMillis,
};

// 3) Criar o índice
db.books.createIndex({ categories: 1, publishedDate: -1 });

// 4) AFTER: EXPLAIN da mesma consulta com o índice
const afterExplain = db.books
  .find({ categories: "Java" })
  .sort({ publishedDate: -1 })
  .limit(10)
  .explain("executionStats");

const simplifiedAfter = {
  totalDocsExamined: afterExplain.executionStats.totalDocsExamined,
  totalKeysExamined: afterExplain.executionStats.totalKeysExamined,
  executionTimeMillis: afterExplain.executionStats.executionTimeMillis,
};

// 5) Mostrar resultados simplificados
[simplifiedBefore, simplifiedAfter];


