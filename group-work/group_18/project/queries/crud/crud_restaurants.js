db = db.getSiblingDB("foodfinder");

// 1. Inserir restaurante
db.restaurants.insertOne({
  name: "New Sushi Place",
  address: "123 Tokyo Street",
  address_line_2: "Lisbon",
  outcode: "LX1",
  postcode: "0AA",
  rating: 4.8,
  type_of_food: "Sushi",
  URL: "http://example.com"
});

// 2. Listar todos
db.restaurants.find();

// 3. Filtrar por tipo de comida
db.restaurants.find({ type_of_food: "Chinese" });

// 4. Filtrar por rating >= 5
db.restaurants.find({ rating: { $gte: 5 } });

// 5. Filtrar por tipo + rating
db.restaurants.find({
  type_of_food: "Chinese",
  rating: { $gte: 5 }
});

// 6. Procurar por outcode
db.restaurants.find({ outcode: "CF24" });

// 7. Atualizar rating
db.restaurants.updateOne(
  { name: "1A Wok" },
  { $set: { rating: 5.5 } }
);

// 8. Atualizar vários
db.restaurants.updateMany(
  { type_of_food: "Chinese" },
  { $inc: { rating: 0.1 } }
);

// 9. Apagar duplicado
db.restaurants.deleteOne({
  _id: ObjectId("55f14312c7447c3da7051b29")
});

// 10. Apagar "Not yet rated"
db.restaurants.deleteMany({
  rating: "Not yet rated"
});
