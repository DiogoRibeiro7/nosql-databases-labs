
db = db.getSiblingDB("group_10_db");
print("--- Pesquisa Textual de Filmes (palavra-chave: time) ---");

db.films.find(
    { $text: { $search: "time" } },
    {
        _id: 0,
        title: 1,
        score: { $meta: "textScore" }  //$meta extrair metadados gerados internamente durante a execução de uma consulta $text Cálculo de Relevância
    }
).sort(
    { score: { $meta: "textScore" } }
).forEach(doc => printjson(doc));
