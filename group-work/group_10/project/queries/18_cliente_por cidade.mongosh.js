
db = db.getSiblingDB("group_10_db");
print("--- Clientes por Cidade: Lisboa ---");

db.customers.find(
    // 1. Filtro: cidade dentro do endereço embebido
    { "address.city": "Lisboa" },

    // 2. Projeção: apenas informação relevante
    {
        _id: 0,
        customerId: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1
    }
).sort(
    // 3. Ordenar alfabeticamente pelo nome
    { lastName: 1, firstName: 1 }
).forEach(doc => printjson(doc));
``
