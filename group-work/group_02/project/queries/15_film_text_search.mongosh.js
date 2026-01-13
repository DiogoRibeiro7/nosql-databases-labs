// Demonstration of text index via find() with $text
// Usage: mongosh queries/15_film_text_search.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

const SEARCH_TERM = "scientist dinosaur";

print(`\n=== Film Search: "${SEARCH_TERM}" ===\n");

// Check and create text index if necessary
const indexes = db.films.getIndexes();
const hasTextIndex = indexes.some((idx) => idx.key && idx.key._fts === "text");

if (!hasTextIndex) {
  print("Text index not found. Creating...");
  db.films.createIndex(
    { title: "text", description: "text" },
    { weights: { title: 10, description: 1 }, name: "idx_film_text_search" }
  );
  print("Text index created.\n");
}

print("Search results:");
db.films
  .find(
    { $text: { $search: SEARCH_TERM } }, //OR logic by default
    { _id: 0, film_id: 1, title: 1, "category.name": 1, rating: 1, score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .limit(10)
  .forEach((doc) => printjson(doc));

print("\n✓ Query executed successfully\n");