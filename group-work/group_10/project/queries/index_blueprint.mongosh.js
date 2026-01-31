
// queries/index_blueprint.mongosh.js

db = db.getSiblingDB("group_10_db");

print(`Using database: ${db.getName()}`);

print("\nRecreating recommended indexes...");


// ============================================================================
// CUSTOMERS
// ============================================================================

// Garante que não existem dois clientes com o mesmo email (segurança e login). Índice Único (unique: true): Além de performance, serve como uma regra de negócio (impede emails duplicados).

db.customers.createIndex(
  { email: 1 },
  { unique: true});

// Acelera a filtragem de listas de clientes "Ativos" ou "Inativos".

db.customers.createIndex(
  { active: 1 },);

// Permite encontrar rapidamente clientes de uma determinada cidade.

db.customers.createIndex(
  { "address.city": 1 },);


// ============================================================================
// FILMS
// ============================================================================

// Transforma o título num índice de pesquisa. Permite procurar por palavras soltas.

db.films.createIndex(
  { title: "text" });

// Otimiza a ordenação (ex: "Mostrar filmes mais recentes primeiro").

db.films.createIndex(
  { releaseYear: 1 });

// Acelera queries que procuram filmes por preço (ex: "Filmes até 3€").

db.films.createIndex(
  { rentalRate: 1 });


// ============================================================================
// STORES
// ============================================================================

// // Fundamental para ligar os alugueres (Rentals) às lojas sem erros.

db.stores.createIndex(
  { storeId: 1 },
  { unique: true });

// Facilita a listagem alfabética das lojas no sistema.

db.stores.createIndex(
  { storeName: 1 });

// Geospatial index for $near and geo analytics - Permite cálculos de mapas (ex: "Qual a loja mais próxima de mim?").

db.stores.createIndex(
  { "address.location": "2dsphere" });


// ============================================================================
// RENTALS
// ============================================================================

// // Índice Composto: Mostra o histórico de um cliente específico ordenado pela data.

db.rentals.createIndex(
  { customerId: 1, rentalDate: -1 });

// Ajuda a gestão a encontrar rapidamente todos os alugueres com estado "overdue" (atrasado).

db.rentals.createIndex(
  { status: 1, rentalDate: -1 });

// Essencial para relatórios de faturação: agrupa vendas por loja e por tempo.

db.rentals.createIndex(
  { storeId: 1, rentalDate: -1 });

// Como "films" é uma lista dentro do aluguer, este índice permite saber 
// rapidamente quais os filmes mais alugados de sempre.

db.rentals.createIndex(
  { "films.filmId": 1 });


// ============================================================================
// Summary
// ============================================================================
print("\nIndexes successfully (re)created. Current index list:");

print("\nCUSTOMERS:");
printjson(db.customers.getIndexes());

print("\nFILMS:");
printjson(db.films.getIndexes());

print("\nSTORES:");
printjson(db.stores.getIndexes());

print("\nRENTALS:");
printjson(db.rentals.getIndexes());

print("\nDone.");

// ============================================================================
// End of index_blueprint.mongosh.js
// ============================================================================
