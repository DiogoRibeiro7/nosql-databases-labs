// Query 06: Disponibilidade de Inventário por Filme e Loja
// Verifica stock disponível via agregação com lookup
// Usage: mongosh queries/06_film_inventory_availability.mongosh.js

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Disponibilidade de Filmes em Inventário ===\n");

db.inventory
  .aggregate([
    // Agrupar por filme e loja
    {
      $group: {
        _id: { film_id: "$film_id", store_id: "$store_id" },
        total_copies: { $sum: 1 },
        available_copies: { $sum: { $cond: ["$available", 1, 0] } }
      }
    },
    // Juntar com filmes para obter título
    {
      $lookup: {
        from: "films",
        localField: "_id.film_id",
        foreignField: "film_id",
        as: "film_info"
      }
    },
    { $unwind: "$film_info" },
    // Projetar campos finais com taxa de disponibilidade
    {
      $project: {
        film_id: "$_id.film_id",
        store_id: "$_id.store_id",
        title: "$film_info.title",
        category: "$film_info.category.name",
        total_copies: 1,
        available_copies: 1,
        availability_rate: {
          $multiply: [{ $divide: ["$available_copies", "$total_copies"] }, 100]
        }
      }
    },
    // Ordenar por disponibilidade crescente
    { $sort: { availability_rate: 1, title: 1 } },
    { $limit: 20 }
  ])
  .forEach((doc) => printjson(doc));

print("\n✓ Query executada com sucesso\n");