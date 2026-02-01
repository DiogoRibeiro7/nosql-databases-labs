
db = db.getSiblingDB("group_10_db");
print("--- Clientes com Alugueres em Atraso ---");

db.rentals.aggregate([
    // 1. Filtrar apenas alugueres em atraso
    { $match: { status: "overdue" } },

    // 2. Agrupar por cliente
    {
        $group: {
            _id: "$customerId",
            overdueCount: { $sum: 1 },
            lastDueDate: { $max: "$dueDate" }
        }
    },

    // 3. Ordenar pelos mais problemáticos
    { $sort: { overdueCount: -1 } },

    // 4. Formatar saída
    {
        $project: {
            _id: 0,
            customerId: "$_id",
            overdueCount: 1,
            lastDueDate: 1
        }
    }
]).forEach(doc => printjson(doc));
