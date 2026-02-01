
db = db.getSiblingDB("group_10_db");
print("--- Distribuição Absoluta dos Estados de Aluguer ---");

db.rentals.aggregate([
    // 1. Agrupar alugueres por estado
    {
        $group: {
            _id: "$status",
            total: { $sum: 1 }
        }
    },

    // 2. Ordenar por frequência
    { $sort: { total: -1 } },

    // 3. Formatar saída
    {
        $project: {
            _id: 0,
            status: "$_id",
            total: 1
        }
    }
]).forEach(doc => printjson(doc));


