// Demonstração de índice de texto via find() com $text
// Usage: mongosh queries/15_film_text_search.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

const SEARCH_TERM = "scientist dinosaur";

print(`\n=== Pesquisa de Filmes: "${SEARCH_TERM}" ===\n`);

// Verificar e criar índice de texto se necessário
const indexes = db.films.getIndexes();
const hasTextIndex = indexes.some((idx) => idx.key && idx.key._fts === "text");

if (!hasTextIndex) {
  print("Índice de texto não encontrado. A criar...");
  db.films.createIndex(
    { title: "text", description: "text" },
    { weights: { title: 10, description: 1 }, name: "idx_film_text_search" }
  );
  print("Índice de texto criado.\n");
}

print("Resultados da pesquisa:");
db.films
  .find(
    { $text: { $search: SEARCH_TERM } }, //lógica OR por defeito
    { _id: 0, film_id: 1, title: 1, "category.name": 1, rating: 1, score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .limit(10)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");