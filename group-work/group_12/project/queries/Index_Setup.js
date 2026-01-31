// Otimiza buscas por localização e tipo de cozinha
db.restaurants.createIndex({ "address.city": 1, type: 1 });

// Otimiza buscas por status do pedido e data (para painéis de administração)
db.orders.createIndex({ status: 1, createdAt: -1 });

// Indexar itens do menu para buscar por categoria ou nome do prato
db.restaurants.createIndex({ "menu.category": 1 });
db.restaurants.createIndex({ "menu.price": 1 });

// Indexar o preço total dos pedidos para filtros de faixa
db.orders.createIndex({ totalPrice: 1 });

// Índice de texto para busca por nome
db.restaurants.createIndex({ name: "text" });

// Índice para ordenar por avaliação
db.restaurants.createIndex({ rating: -1 });

// Essencial para performance do $lookup (Foreign Key)
db.orders.createIndex({ restaurantId: 1 });