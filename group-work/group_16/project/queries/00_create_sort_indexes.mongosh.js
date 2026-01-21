
db = db.getSiblingDB("Food_express");

print("Create sort index");

//
// ÍNDICES PARA A COLEÇÃO ORDERS
//

// Índice composto para queries que:
// - filtram por totalPrice
// - ordenam por data (createdAt)
// Usado em queries de encomendas recentes e de valor elevado
db.orders.createIndex(
  { totalPrice: 1, createdAt: -1 }
);

// Índice para ordenar encomendas por data (mais recentes primeiro)
db.orders.createIndex(
  { createdAt: -1 }
);

// Índice composto para:
// - filtrar por status
// - agrupar e ordenar por hora (createdAt)
db.orders.createIndex(
  { status: 1, createdAt: 1 }
);

//
// ÍNDICES PARA A COLEÇÃO RESTAURANTS
//

// Índice para queries que:
// - filtram por cidade
// - ordenam por rating
db.restaurants.createIndex(
  { "address.city": 1, rating: -1 }
);

print("Índices criados com sucesso.");