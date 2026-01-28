
db = db.getSiblingDB("group_10_db");
print("--- Filmes com Preço Até 3€ ---");

db.films.find(
    { rentalRate: { $lte: 3 } },
    {
        _id: 0,
        title: 1,
        rentalRate: 1
    }
).sort({ rentalRate: 1 })
 .forEach(doc => printjson(doc));
