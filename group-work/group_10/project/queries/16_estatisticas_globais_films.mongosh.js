
db = db.getSiblingDB("group_10_db");
print("--- Estatísticas Globais do Catálogo ---");





db.films.aggregate([
    {
        $group: {
            _id: null,
            //Não agrupar por nenhum campo, Resultado final será um único documento com estatísticas globais
            totalFilms: { $sum: 1 }, //Quantos filmes existem
            avgPrice: { $avg: "$rentalRate" }, 
             //preço médio de aluguer
            minPrice: { $min:  "$rentalRate" }, //preço mínimo
            maxPrice: { $max: "$rentalRate" } //preço máximo
        }
    },
    {
        $project: {
            _id: 0,
            totalFilms: 1,
            avgPrice: { $round: ["$avgPrice", 2] },
            minPrice: 1,
            maxPrice: 1
        }
    }
]).forEach(doc => printjson(doc));
