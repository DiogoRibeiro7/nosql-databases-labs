
db = db.getSiblingDB("group_10_db");
print("--- Tendência Diária de Alugueres ---");

db.rentals.aggregate([
    // 1. Agrupar alugueres por dia (ignorando horas)
    {
        $group: {
            _id: {
                date: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$rentalDate"
                    }
                }
            },
            totalRentals: { $sum: 1 }
        }
    },

    // 2. Ordenar cronologicamente
    { $sort: { "_id.date": 1 } },

    // 3. Formatar saída
    {
        $project: {
            _id: 0,
            date: "$_id.date",
            totalRentals: 1
        }
    }
]).forEach(doc => printjson(doc));
