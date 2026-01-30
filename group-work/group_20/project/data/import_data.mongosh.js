use("healthcare");

// Função para inserir apenas se não existir
function insertIfNotExists(collection, query, document) {
  const exists = db[collection].findOne(query);
  if (!exists) {
    db[collection].insertOne(document);
    print("✔ Inserido:", JSON.stringify(query));
  } else {
    print("⏭ Ignorado (já existe):", JSON.stringify(query));
  }
}

// Tornar a função global para os ficheiros carregados
globalThis.insertIfNotExists = insertIfNotExists;

// Carregar ficheiros de dados
load("./data/patients.mongosh.js");
load("./data/clinical_encounters.mongosh.js");
load("./data/lab_results.mongosh.js");
load("./data/providers.mongosh.js");
load("./data/audit_logs.mongosh.js");

print("✔ Dados importados com sucesso (com verificação de duplicados)!");
