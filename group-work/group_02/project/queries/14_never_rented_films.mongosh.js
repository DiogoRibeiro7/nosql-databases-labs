// Query 14: Filmes Nunca Alugados
// Identifica inventário morto via lookup entre films e rentals
// Usage: mongosh queries/14_never_rented_films.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Filmes sem Histórico de Alugueres ===\n");

db.films
  .aggregate([
    // Juntar com rentals
    {
      $lookup: {
        from: "rentals",
        localField: "film_id",
        foreignField: "film.film_id",
        as: "rental_history"
      }
    },
    // Filtrar filmes sem alugueres
    { $match: { rental_history: { $size: 0 } } },
    // Juntar com inventory para contar cópias
    {
      $lookup: {
        from: "inventory",
        localField: "film_id",
        foreignField: "film_id",
        as: "inventory_items"
      }
    },
    // Projetar campos finais
    {
      $project: {
        film_id: 1,
        title: 1,
        category: "$category.name",
        rating: 1,
        rental_rate: 1,
        inventory_count: { $size: "$inventory_items" }
      }
    },
    // Ordenar por cópias descendente
    { $sort: { inventory_count: -1, title: 1 } },
    { $limit: 25 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");