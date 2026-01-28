// 1. Criar review
db.reviews.insertOne({
  restaurantId: ObjectId("55f14312c7447c3da7051b26"),
  user: "Miguel",
  rating: 4,
  comment: "Muito bom!",
  createdAt: ISODate()
});

// 2. Criar várias reviews
db.reviews.insertMany([
  {
    restaurantId: ObjectId("55f14312c7447c3da7051b26"),
    user: "Ana",
    rating: 5,
    comment: "Excelente serviço.",
    createdAt: ISODate()
  },
  {
    restaurantId: ObjectId("55f14312c7447c3da7051b27"),
    user: "João",
    rating: 3,
    comment: "Entrega lenta.",
    createdAt: ISODate()
  }
]);

// 3. Reviews de um restaurante
db.reviews.find({
  restaurantId: ObjectId("55f14312c7447c3da7051b26")
});

// 4. Reviews de um user
db.reviews.find({ user: "Miguel" });

// 5. Atualizar rating
db.reviews.updateOne(
  { user: "Miguel", restaurantId: ObjectId("55f14312c7447c3da7051b26") },
  { $set: { rating: 5 } }
);

// 6. Adicionar editedAt
db.reviews.updateOne(
  { user: "Miguel", restaurantId: ObjectId("55f14312c7447c3da7051b26") },
  { $set: { editedAt: ISODate() } }
);

// 7. Apagar review
db.reviews.deleteOne({
  user: "João",
  restaurantId: ObjectId("55f14312c7447c3da7051b27")
});

// 8. Apagar todas as reviews de um restaurante
db.reviews.deleteMany({
  restaurantId: ObjectId("55f14312c7447c3da7051b27")
});
