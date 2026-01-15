// CREATE

db.films.insertOne({
  title: "Matrix",
  description: "Sci-fi clássico",
  releaseYear: 1999,
  rentalDurationDays: 3,
  rentalRate: 2.99,
  stockPolicy: { maxLateFeePerRental: 10 },
  lastUpdate: new Date()
});

db.films.insertMany([
  { title: "Inception", releaseYear: 2010, rentalDurationDays: 3, rentalRate: 3.49, lastUpdate: new Date() },
  { title: "Interstellar", releaseYear: 2014, rentalDurationDays: 5, rentalRate: 3.99, lastUpdate: new Date() }
]);


//READ


// 1) Pesquisa full-text por título (INDEX: { title: "text" } ou { title:"text", description:"text" })
db.films.find({ $text: { $search: "Matrix" } });

// 2) Filtrar por ano e ordenar (INDEX: { releaseYear: 1 })
db.films.find({ releaseYear: { $gte: 2000 } })
        .project({ title: 1, releaseYear: 1 })
        .sort({ releaseYear: 1 });




//UPDATE

// Atualizar preço de aluguer
db.films.updateOne(
  { title: "Inception" },
  { $set: { rentalRate: 3.99, lastUpdate: new Date() } }
);

// Definir política de multa caso não exista
db.films.updateMany(
  { stockPolicy: null },
  { $set: { stockPolicy: { maxLateFeePerRental: 10 }, lastUpdate: new Date() } }
);

// Remover descrição (se redundante)
db.films.updateOne({ title: "Interstellar" }, { $unset: { description: "" } });


//DELETE

// eliminar filme pode afetar relatórios (recomenda-se soft delete)
db.films.deleteOne({ title: "Interstellar" });

// Soft delete (ex.: marcação num campo opcional)
db.films.updateOne({ _id: ObjectId("...") }, { $set: { deletedAt: new Date() } });
