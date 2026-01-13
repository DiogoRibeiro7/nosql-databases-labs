// Index Blueprint - Sakila MongoDB Optimization
// Define índices otimizados para queries de negócio e performance
// Usage: mongosh queries/index_blueprint.mongosh.js

db = db.getSiblingDB("sakila_mongodb");
print(`Using database: ${db.getName()}`);

print("\n=== Criação de Índices Únicos ===\n");

// Índices únicos para chaves primárias
print("Aplicando índices únicos...");
printjson(db.films.createIndex({ film_id: 1 }, { unique: true, name: "idx_film_id_unique" }));
printjson(db.customers.createIndex({ customer_id: 1 }, { unique: true, name: "idx_customer_id_unique" }));
printjson(db.rentals.createIndex({ rental_id: 1 }, { unique: true, name: "idx_rental_id_unique" }));
printjson(db.inventory.createIndex({ inventory_id: 1 }, { unique: true, name: "idx_inventory_id_unique" }));
printjson(db.stores.createIndex({ store_id: 1 }, { unique: true, name: "idx_store_id_unique" }));

print("\n=== Índices para Films ===\n");

// Índice para pesquisa por categoria
printjson(db.films.createIndex({ "category.name": 1 }, { name: "idx_category_name" }));

// Índice composto para filtros de catálogo
printjson(db.films.createIndex({ rating: 1, rental_rate: 1 }, { name: "idx_rating_rental_rate" }));

// Índice de texto para full-text search
printjson(db.films.createIndex(
  { title: "text", description: "text" },
  { weights: { title: 10, description: 1 }, name: "idx_film_text_search" }
));

print("\n=== Índices para Customers ===\n");

// Índice para email (autenticação)
printjson(db.customers.createIndex({ email: 1 }, { name: "idx_customer_email" }));

// Índice para segmentação de clientes
printjson(db.customers.createIndex({ store_id: 1, active: 1 }, { name: "idx_customer_segmentation" }));

// Índice para análise geográfica
printjson(db.customers.createIndex(
  { "address.city.country": 1, "address.city.city_name": 1 },
  { name: "idx_customer_location" }
));

print("\n=== Índices para Rentals ===\n");

// Índice para histórico de cliente
printjson(db.rentals.createIndex(
  { "customer.customer_id": 1, rental_date: -1 },
  { name: "idx_customer_rental_history" }
));

// Índice para análise temporal
printjson(db.rentals.createIndex({ rental_date: -1 }, { name: "idx_rental_date_desc" }));

// Índice para devoluções pendentes
printjson(db.rentals.createIndex(
  { return_date: 1, rental_date: 1 },
  { name: "idx_return_status" }
));

// Índice para agregações por loja/categoria
printjson(db.rentals.createIndex(
  { store_id: 1, "film.category": 1 },
  { name: "idx_store_category_analysis" }
));

// Índice para lookup de filmes
printjson(db.rentals.createIndex({ "film.film_id": 1 }, { name: "idx_rental_film_id" }));

print("\n=== Índices para Inventory ===\n");

// Índice para verificação de disponibilidade
printjson(db.inventory.createIndex(
  { film_id: 1, store_id: 1, available: 1 },
  { name: "idx_availability_check" }
));

print("\n=== Resumo de Índices ===\n");

const collections = ["films", "customers", "rentals", "inventory", "stores"];
collections.forEach((collName) => {
  const indexes = db[collName].getIndexes();
  print(`${collName}: ${indexes.length} índices`);
});

print("\nDone. Run db.<collection>.getIndexes() to inspect the results.");
