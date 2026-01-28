

db = db.getSiblingDB("group_10_db");
print("--- Clientes Inativos Criados Antes de 2025 ---");

db.customers.find(
    // 1. Filtro: clientes inativos
    {
        active: false,
        // 2. Data de criação anterior a 1 de janeiro de 2025
        createDate: { $lt: ISODate("2025-01-01") }
    },
    // 3. Projeção: apenas campos relevantes para análise
    {
        _id: 0,
        customerId: 1,
        firstName: 1,
        lastName: 1,
        createDate: 1,
        email: 1
    }
).sort(
    // 4. Ordenar do mais antigo para o mais recente
    { createDate: 1 }
).forEach(doc => printjson(doc));

