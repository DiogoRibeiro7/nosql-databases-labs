db = db.getSiblingDB("group_10_db");
print("--- Tabela de Fidelidade: Clientes com 2 ou mais alugueres ---");
            //Aggregation Pipeline

db.rentals.aggregate([
    // 1. Agrupar por cliente para contar alugueres e capturar dados
    {
        $group: {
            _id: "$customerId",
            totalRentals: { $sum: 1 },
            // Captura os IDs únicos dos filmes que o cliente já alugou,  $addToSet adiciona um valor a um array apenas se esse valor ainda não existir no conjunto
            
            filmsRented: { $addToSet: "$films.title" }, 
            // Encontra a data do aluguer mais recente
            lastRentalDate: { $max: "$rentalDate" },
            // Identifica as lojas onde o cliente costuma ir
            storesVisited: { $addToSet: "$storeId" }
        }
    },

    // 2. Filtrar apenas clientes "leais" (2 ou mais visitas/alugueres)
    { $match: { totalRentals: { $gte: 2 } } },

    // 3. Ordenar: Clientes com mais alugueres no topo, depois pelos mais recentes
    { $sort: { totalRentals: -1, lastRentalDate: -1 } },

    // 4. (Opcional) Limpar o output para ser mais legível
    {
        $project: {
            _id: 0,
            customerId: "$_id",
            totalRentals: 1,
            lastRentalDate: 1,
            storesVisited: 1,
            uniqueFilmsCount: { $size: "$filmsRented" } // Quantos filmes diferentes viu
        }
    }
]).forEach((doc) => printjson(doc));