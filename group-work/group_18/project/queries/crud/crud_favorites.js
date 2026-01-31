db = db.getSiblingDB("foodfinder");

// 1. Adicionar favorito
db.favorites.insertOne({
  user: "Miguel",
  restaurantId: ObjectId("55f14312c7447c3da7051b26"),
  createdAt: ISODate()
});

// 2. Adicionar vários
db.favorites.insertMany([
  {
    user: "Miguel",
    restaurantId: ObjectId("55f14312c7447c3da7051b27"),
    createdAt: ISODate()
  },
  {
    user: "Ana",
    restaurantId: ObjectId("55f14312c7447c3da7051b26"),
    createdAt: ISODate()
  }
]);

// 3. Listar favoritos de um user
db.favorites.find({ user: "Miguel" });

// 4. Ver se é favorito
db.favorites.findOne({
  user: "Miguel",
  restaurantId: ObjectId("55f14312c7447c3da7051b26")
});

// 5. Remover favorito
db.favorites.deleteOne({
  user: "Miguel",
  restaurantId: ObjectId("55f14312c7447c3da7051b26")
});

// 6. Remover todos os favoritos de um user
db.favorites.deleteMany({ user: "Miguel" });
