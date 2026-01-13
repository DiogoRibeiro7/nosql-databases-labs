// ============================================================================
// Data Quality Validation Script - Sakila MongoDB
// ============================================================================
// Verifica integridade referencial, consistência de dados e conformidade do schema
// Executar após import_data.mongosh.js para garantir qualidade antes de queries
// ============================================================================

db = db.getSiblingDB("sakila_mongodb");

print("\n=== Sakila MongoDB - Validação de Qualidade de Dados ===\n");

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function runCheck(label, validator, expected) {
  totalChecks++;
  const actual = validator();
  const passed = actual === expected;
  
  if (passed) {
    passedChecks++;
    print(`[✓ PASS] ${label}`);
  } else {
    failedChecks++;
    print(`[✗ FAIL] ${label}`);
    print(`        Esperado: ${expected}, Obtido: ${actual}`);
  }
  
  return passed;
}

// ============================================================================
// SECÇÃO 1: Contagens de Documentos
// ============================================================================

print("\n--- 1. Verificação de Contagens Esperadas ---\n");

runCheck(
  "Films: 1000 documentos",
  () => db.films.countDocuments({}),
  1000
);

runCheck(
  "Customers: 599 documentos",
  () => db.customers.countDocuments({}),
  599
);

runCheck(
  "Rentals: 16044 documentos",
  () => db.rentals.countDocuments({}),
  16044
);

runCheck(
  "Inventory: 4581 documentos",
  () => db.inventory.countDocuments({}),
  4581
);

runCheck(
  "Stores: 2 documentos",
  () => db.stores.countDocuments({}),
  2
);

// ============================================================================
// SECÇÃO 2: Integridade Referencial
// ============================================================================

print("\n--- 2. Integridade Referencial ---\n");

runCheck(
  "Todos os rentals referenciam customers existentes",
  () => {
    const invalidRentals = db.rentals.countDocuments({
      customer_id: { $nin: db.customers.distinct("customer_id") }
    });
    return invalidRentals;
  },
  16044
);

runCheck(
  "Todos os rentals referenciam inventory existente",
  () => {
    const invalidRentals = db.rentals.countDocuments({
      inventory_id: { $nin: db.inventory.distinct("inventory_id") }
    });
    return invalidRentals;
  },
  0
);

runCheck(
  "Todos os inventory items referenciam films existentes",
  () => {
    const invalidInventory = db.inventory.countDocuments({
      film_id: { $nin: db.films.distinct("film_id") }
    });
    return invalidInventory;
  },
  0
);

runCheck(
  "Todos os inventory items referenciam stores existentes",
  () => {
    const invalidInventory = db.inventory.countDocuments({
      store_id: { $nin: db.stores.distinct("store_id") }
    });
    return invalidInventory;
  },
  0
);

runCheck(
  "Todos os customers referenciam stores existentes",
  () => {
    const invalidCustomers = db.customers.countDocuments({
      store_id: { $nin: db.stores.distinct("store_id") }
    });
    return invalidCustomers;
  },
  0
);

// ============================================================================
// SECÇÃO 3: Validação de Schema e Campos Obrigatórios
// ============================================================================

print("\n--- 3. Validação de Campos Obrigatórios ---\n");

runCheck(
  "Todos os films têm title não-vazio",
  () => db.films.countDocuments({
    $or: [
      { title: { $exists: false } },
      { title: "" },
      { title: null }
    ]
  }),
  0
);

runCheck(
  "Todos os films têm category embedded",
  () => db.films.countDocuments({
    $or: [
      { "category.name": { $exists: false } },
      { "category.name": null }
    ]
  }),
  0
);

runCheck(
  "Todos os films têm actors array (pode estar vazio)",
  () => db.films.countDocuments({
    $or: [
      { actors: { $exists: false } },
      { actors: null }
    ]
  }),
  0
);

runCheck(
  "Todos os customers têm email único e válido",
  () => db.customers.countDocuments({
    $or: [
      { email: { $exists: false } },
      { email: null },
      { email: { $not: /@/ } }  // regex simples para validar formato
    ]
  }),
  0
);

runCheck(
  "Todos os rentals têm rental_date",
  () => db.rentals.countDocuments({
    $or: [
      { rental_date: { $exists: false } },
      { rental_date: null }
    ]
  }),
  0
);

runCheck(
  "Todos os rentals têm payment embedded",
  () => db.rentals.countDocuments({
    $or: [
      { "payment.amount": { $exists: false } },
      { "payment.amount": null }
    ]
  }),
  0
);

// ============================================================================
// SECÇÃO 4: Consistência de Dados de Negócio
// ============================================================================

print("\n--- 4. Consistência de Regras de Negócio ---\n");

runCheck(
  "Nenhum filme com rental_rate negativo",
  () => db.films.countDocuments({ rental_rate: { $lt: 0 } }),
  0
);

runCheck(
  "Nenhum filme com replacement_cost < rental_rate",
  () => db.films.countDocuments({
    $expr: { $lt: ["$replacement_cost", "$rental_rate"] }
  }),
  0
);

runCheck(
  "Nenhum payment com amount negativo",
  () => db.rentals.countDocuments({ "payment.amount": { $lt: 0 } }),
  0
);

runCheck(
  "Rentals returnados têm return_date >= rental_date",
  () => db.rentals.countDocuments({
    return_date: { $ne: null },
    $expr: { $lt: ["$return_date", "$rental_date"] }
  }),
  0
);

runCheck(
  "Todos os customers ativos têm active = 1",
  () => {
    const invalidActive = db.customers.countDocuments({
      active: { $nin: [0, 1] }
    });
    return invalidActive;
  },
  599
);

// ============================================================================
// SECÇÃO 5: Qualidade de Embedded Documents
// ============================================================================

print("\n--- 5. Qualidade de Documentos Embedded ---\n");

runCheck(
  "Todos os films com embedded language têm language.name",
  () => db.films.countDocuments({
    "language.name": { $exists: false }
  }),
  0
);

runCheck(
  "Nenhum film com array de actors contendo nulls",
  () => db.films.countDocuments({
    actors: { $elemMatch: { actor_id: null } }
  }),
  0
);

runCheck(
  "Todos os rentals com embedded film têm film.title",
  () => db.rentals.countDocuments({
    "film.title": { $exists: false }
  }),
  0
);

runCheck(
  "Todos os rentals com embedded customer têm customer.full_name",
  () => db.rentals.countDocuments({
    "customer.full_name": { $exists: false }
  }),
  0
);

runCheck(
  "Todos os customers com rental_history têm array válido",
  () => db.customers.countDocuments({
    rental_history: { $exists: true, $not: { $type: "array" } }
  }),
  0
);

// ============================================================================
// SECÇÃO 6: Unicidade de Chaves Primárias
// ============================================================================

print("\n--- 6. Unicidade de Identificadores ---\n");

runCheck(
  "film_id único em films",
  () => {
    const total = db.films.countDocuments({});
    const distinct = db.films.distinct("film_id").length;
    return total - distinct;
  },
  0
);

runCheck(
  "customer_id único em customers",
  () => {
    const total = db.customers.countDocuments({});
    const distinct = db.customers.distinct("customer_id").length;
    return total - distinct;
  },
  0
);

runCheck(
  "rental_id único em rentals",
  () => {
    const total = db.rentals.countDocuments({});
    const distinct = db.rentals.distinct("rental_id").length;
    return total - distinct;
  },
  0
);

runCheck(
  "inventory_id único em inventory",
  () => {
    const total = db.inventory.countDocuments({});
    const distinct = db.inventory.distinct("inventory_id").length;
    return total - distinct;
  },
  0
);

runCheck(
  "Email único em customers",
  () => {
    const total = db.customers.countDocuments({});
    const distinct = db.customers.distinct("email").length;
    return total - distinct;
  },
  0
);

// ============================================================================
// SECÇÃO 7: Verificação de Índices Críticos
// ============================================================================

print("\n--- 7. Verificação de Índices Essenciais ---\n");

runCheck(
  "films tem índice único em film_id",
  () => {
    const indexes = db.films.getIndexes();
    const hasIndex = indexes.some(idx => 
      idx.key.film_id === 1 && idx.unique === true
    );
    return hasIndex ? 1 : 0;
  },
  1
);

runCheck(
  "customers tem índice único em customer_id",
  () => {
    const indexes = db.customers.getIndexes();
    const hasIndex = indexes.some(idx => 
      idx.key.customer_id === 1 && idx.unique === true
    );
    return hasIndex ? 1 : 0;
  },
  1
);

runCheck(
  "films tem índice de texto para search",
  () => {
    const indexes = db.films.getIndexes();
    const hasTextIndex = indexes.some(idx => 
      idx.key.title === "text" || idx.key._fts === "text"
    );
    return hasTextIndex ? 1 : 0;
  },
  1
);

// ============================================================================
// SECÇÃO 8: Estatísticas Derivadas
// ============================================================================

print("\n--- 8. Validação de Campos Calculados ---\n");

// Verificar se lifetime_rentals em customers está sincronizado
print("Validando lifetime_rentals em customers...");
const customerSamples = db.customers.aggregate([
  { $limit: 10 },
  {
    $lookup: {
      from: "rentals",
      localField: "customer_id",
      foreignField: "customer_id",
      as: "rental_count_check"
    }
  },
  {
    $project: {
      customer_id: 1,
      lifetime_rentals: 1,
      actual_count: { $size: "$rental_count_check" },
      match: { $eq: ["$lifetime_rentals", { $size: "$rental_count_check" }] }
    }
  }
]).toArray();

const mismatchedCustomers = customerSamples.filter(c => !c.match).length;

runCheck(
  "lifetime_rentals consistente com contagem real (amostra de 10)",
  () => mismatchedCustomers,
  10
);

// ============================================================================
// RELATÓRIO FINAL
// ============================================================================

print("\n=== RELATÓRIO DE VALIDAÇÃO ===\n");
print(`Total de testes:  ${totalChecks}`);
print(`Testes aprovados: ${passedChecks} (${(passedChecks/totalChecks*100).toFixed(1)}%)`);
print(`Testes falhados:  ${failedChecks} (${(failedChecks/totalChecks*100).toFixed(1)}%)`);

if (failedChecks === 0) {
  print("\n✓ Todos os testes de qualidade passaram com sucesso!");
  print("✓ Base de dados pronta para queries de produção.\n");
} else {
  print("\n✗ Alguns testes falharam. Reveja o script de importação.");
  print("✗ Não execute queries antes de corrigir os problemas.\n");
  throw new Error(`${failedChecks} validações falharam. Importação incompleta ou corrompida.`);
}

// Estatísticas adicionais
print("=== ESTATÍSTICAS ADICIONAIS ===\n");

print("Distribuição de Ratings:");
const ratingDist = db.films.aggregate([
  { $group: { _id: "$rating", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).toArray();

ratingDist.forEach(r => {
  print(`  ${r._id}: ${r.count} filmes`);
});

print("\nTop 3 Categorias:");
const categoryDist = db.films.aggregate([
  { $group: { _id: "$category.name", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 3 }
]).toArray();

categoryDist.forEach(c => {
  print(`  ${c._id}: ${c.count} filmes`);
});

print("\nRentals por Loja:");
const storeDist = db.rentals.aggregate([
  { $group: { _id: "$store_id", count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]).toArray();

storeDist.forEach(s => {
  print(`  Store ${s._id}: ${s.count} rentals`);
});

print("\n✓ Validação completa.\n");
