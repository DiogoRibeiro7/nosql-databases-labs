db = db.getSiblingDB("food_express");
print("Optimizing the engine for: ${db.getName()}");

// Não permite que o numero de encomendas seja repetido
printjson(db.orders.createIndex({ orderNumber: 1 }, { unique: true }));

// Preço da encomenda mais barata para a mais cara e a data do mais recente ao mais antigo
printjson(db.orders.createIndex({ totalPrice: 1, createdAt: -1 }));

// Ordem do restaurantID do menor para o maior
printjson(db.orders.createIndex({ restaurantId: 1 }));

// Status por ordem alfabetica
printjson(db.orders.createIndex({ status: 1 }));


// addresscity por ordem crescente e classificação de maior para menor
printjson(db.restaurants.createIndex({ "address.city": 1, rating: -1 }));

//Ordem alfabetica 
printjson(db.restaurants.createIndex({ type: 1 }));

// menu.category em ordem alfabética e preço do mais barato ao mais caro
printjson(db.restaurants.createIndex({ "menu.category": 1, "menu.price": 1 }));

print("\nAll performance layers are active. Run 'db.getCollectionNames().forEach(c => printjson(db[c].getIndexes()))' to inspect the results.");