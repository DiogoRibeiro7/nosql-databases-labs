// ============================================================================
// Sakila MongoDB Data Import Script
// ============================================================================
// Converte dados relacionais do Sakila (CSV/JSON) para modelo de documentos NoSQL
// Implementa estratégia de denormalização com embedding e referências
// ============================================================================

print("\n=== Sakila MongoDB Import - Inicialização ===\n");

// Configuração da base de dados
const DB_NAME = "sakila_mongodb";
db = db.getSiblingDB(DB_NAME);

print(`Base de dados ativa: ${DB_NAME}`);
print("Removendo coleções existentes para importação limpa...\n");

// Eliminar coleções existentes
db.films.drop();
db.customers.drop();
db.rentals.drop();
db.inventory.drop();
db.stores.drop();

print("Coleções eliminadas. A iniciar importação...\n");

// ============================================================================
// FASE 1: Carregar dados brutos dos ficheiros JSON
// ============================================================================

print("FASE 1: Leitura de ficheiros JSON fonte...");

const fs = require('fs');
const dataPath = "./data/";

// Função auxiliar para ler ficheiros JSON
function loadJSON(filename) {
  return JSON.parse(fs.readFileSync(dataPath + filename, 'utf8'));
}

// Carregar dados auxiliares
const languagesRaw = loadJSON('language.json');
const categoriesRaw = loadJSON('category.json');
const actorsRaw = loadJSON('actor.json');
const filmActorsRaw = loadJSON('film_actor.json');
const filmCategoriesRaw = loadJSON('film_category.json');

// Carregar dados principais
const filmsRaw = loadJSON('film.json');
const customersRaw = loadJSON('customer.json');
const addressesRaw = loadJSON('address.json');
const citiesRaw = loadJSON('city.json');
const countriesRaw = loadJSON('country.json');
const rentalsRaw = loadJSON('rental.json');
const paymentsRaw = loadJSON('payment.json');
const inventoryRaw = loadJSON('inventory.json');
const storesRaw = loadJSON('store.json');
const staffRaw = loadJSON('staff.json');

print(`✓ Ficheiros carregados: ${filmsRaw.length} filmes, ${customersRaw.length} clientes, ${rentalsRaw.length} alugueres\n`);

// ============================================================================
// FASE 2: Construir mapas de lookup para denormalização
// ============================================================================

print("FASE 2: Construção de índices de lookup...");

// Mapa de idiomas
const languageMap = new Map();
languagesRaw.forEach(lang => {
  languageMap.set(lang.language_id, {
    language_id: lang.language_id,
    name: lang.name
  });
});

// Mapa de categorias
const categoryMap = new Map();
categoriesRaw.forEach(cat => {
  categoryMap.set(cat.category_id, {
    category_id: cat.category_id,
    name: cat.name
  });
});

// Mapa de atores
const actorMap = new Map();
actorsRaw.forEach(actor => {
  actorMap.set(actor.actor_id, {
    actor_id: actor.actor_id,
    first_name: actor.first_name,
    last_name: actor.last_name
  });
});

// Mapa filme -> atores (agregação N:M)
const filmActorsMap = new Map();
filmActorsRaw.forEach(fa => {
  if (!filmActorsMap.has(fa.film_id)) {
    filmActorsMap.set(fa.film_id, []);
  }
  const actor = actorMap.get(fa.actor_id);
  if (actor) {
    filmActorsMap.get(fa.film_id).push(actor);
  }
});

// Mapa filme -> categoria
const filmCategoryMap = new Map();
filmCategoriesRaw.forEach(fc => {
  const category = categoryMap.get(fc.category_id);
  if (category) {
    filmCategoryMap.set(fc.film_id, category);
  }
});

// Mapa de países
const countryMap = new Map();
countriesRaw.forEach(country => {
  countryMap.set(country.country_id, country.country);
});

// Mapa de cidades (com país embedded)
const cityMap = new Map();
citiesRaw.forEach(city => {
  cityMap.set(city.city_id, {
    city_id: city.city_id,
    city_name: city.city,
    country: countryMap.get(city.country_id) || "Unknown"
  });
});

// Mapa de moradas (com cidade/país embedded)
const addressMap = new Map();
addressesRaw.forEach(addr => {
  const city = cityMap.get(addr.city_id);
  addressMap.set(addr.address_id, {
    address_id: addr.address_id,
    address_line: addr.address,
    district: addr.district || "",
    postal_code: addr.postal_code || "",
    phone: addr.phone || "",
    city: city || { city_name: "Unknown", country: "Unknown" }
  });
});

// Mapa de staff
const staffMap = new Map();
staffRaw.forEach(staff => {
  staffMap.set(staff.staff_id, {
    staff_id: staff.staff_id,
    first_name: staff.first_name,
    last_name: staff.last_name,
    email: staff.email,
    active: staff.active === 1
  });
});

// Mapa de pagamentos (rental_id -> payment)
const paymentMap = new Map();
paymentsRaw.forEach(payment => {
  paymentMap.set(payment.rental_id, {
    payment_id: payment.payment_id,
    amount: NumberDecimal(payment.amount.toString()),
    payment_date: new Date(payment.payment_date)
  });
});

print(`✓ Mapas criados: ${filmActorsMap.size} filmes com atores, ${paymentMap.size} pagamentos\n`);

// ============================================================================
// FASE 3: Transformar e inserir coleção FILMS (enriquecida)
// ============================================================================

print("FASE 3: Inserção de filmes enriquecidos...");

const filmsTransformed = filmsRaw.map(film => {
  const actors = filmActorsMap.get(film.film_id) || [];
  const category = filmCategoryMap.get(film.film_id) || { category_id: null, name: "Uncategorized" };
  const language = languageMap.get(film.language_id) || { language_id: null, name: "Unknown" };
  
  // Processar special_features (string delimitada por vírgula -> array)
  let specialFeatures = [];
  if (film.special_features) {
    specialFeatures = film.special_features.split(',').map(f => f.trim());
  }
  
  return {
    film_id: film.film_id,
    title: String(film.title || ""),
    description: String(film.description || ""),
    release_year: film.release_year || 2006,
    language: language,
    rental_duration: film.rental_duration || 3,
    rental_rate: NumberDecimal(film.rental_rate.toString()),
    length: film.length || 0,
    replacement_cost: NumberDecimal(film.replacement_cost.toString()),
    rating: String(film.rating || "G"),
    special_features: specialFeatures,
    category: category,
    actors: actors,
    last_update: new Date(film.last_update)
  };
});

db.films.insertMany(filmsTransformed);
print(`✓ ${filmsTransformed.length} filmes inseridos com categorias e atores embedded\n`);

// ============================================================================
// FASE 4: Transformar e inserir coleção INVENTORY
// ============================================================================

print("FASE 4: Inserção de inventário...");

const inventoryTransformed = inventoryRaw.map(inv => ({
  inventory_id: inv.inventory_id,
  film_id: inv.film_id,
  store_id: inv.store_id,
  available: true, // Será atualizado com base em rentals ativos
  current_rental_id: null,
  last_update: new Date(inv.last_update)
}));

db.inventory.insertMany(inventoryTransformed);
print(`✓ ${inventoryTransformed.length} itens de inventário inseridos\n`);

// ============================================================================
// FASE 5: Transformar e inserir coleção STORES
// ============================================================================

print("FASE 5: Inserção de lojas...");

const storesTransformed = storesRaw.map(store => {
  const manager = staffMap.get(store.manager_staff_id);
  const address = addressMap.get(store.address_id);
  
  return {
    store_id: store.store_id,
    manager: manager || {},
    address: address || {},
    total_inventory: inventoryTransformed.filter(i => i.store_id === store.store_id).length,
    total_customers: 0, // Será atualizado após inserção de customers
    last_update: new Date(store.last_update)
  };
});

db.stores.insertMany(storesTransformed);
print(`✓ ${storesTransformed.length} lojas inseridas\n`);

// ============================================================================
// FASE 6: Criar mapa de filmes para embedding em rentals
// ============================================================================

print("FASE 6: Preparação de mapas de denormalização para rentals...");

const filmMap = new Map();
db.films.find().forEach(film => {
  filmMap.set(film.film_id, {
    film_id: film.film_id,
    title: film.title,
    category: film.category.name,
    rental_rate: film.rental_rate
  });
});

const inventoryFilmMap = new Map();
inventoryTransformed.forEach(inv => {
  inventoryFilmMap.set(inv.inventory_id, {
    film_id: inv.film_id,
    store_id: inv.store_id
  });
});

print(`✓ Mapa de filmes criado para embedding\n`);

// ============================================================================
// FASE 7: Transformar e inserir coleção CUSTOMERS (com rental summary)
// ============================================================================

print("FASE 7: Inserção de clientes com histórico de alugueres...");

// Criar mapa rental_id -> rental para embedding em customers
const rentalsByCustomer = new Map();
rentalsRaw.forEach(rental => {
  if (!rentalsByCustomer.has(rental.customer_id)) {
    rentalsByCustomer.set(rental.customer_id, []);
  }
  rentalsByCustomer.get(rental.customer_id).push(rental);
});

const customersTransformed = customersRaw.map(customer => {
  const address = addressMap.get(customer.address_id) || {};
  const customerRentals = rentalsByCustomer.get(customer.customer_id) || [];
  
  // Ordenar rentals por data e pegar os 10 mais recentes
  const recentRentals = customerRentals
    .sort((a, b) => new Date(b.rental_date) - new Date(a.rental_date))
    .slice(0, 10)
    .map(rental => {
      const invInfo = inventoryFilmMap.get(rental.inventory_id) || {};
      const filmInfo = filmMap.get(invInfo.film_id) || { title: "Unknown" };
      const payment = paymentMap.get(rental.rental_id);
      
      return {
        rental_id: rental.rental_id,
        rental_date: new Date(rental.rental_date),
        film_title: filmInfo.title,
        return_date: rental.return_date ? new Date(rental.return_date) : null,
        amount: payment ? payment.amount : NumberDecimal("0")
      };
    });
  
  // Calcular lifetime value
  const lifetimeValue = customerRentals.reduce((sum, rental) => {
    const payment = paymentMap.get(rental.rental_id);
    return sum + (payment ? parseFloat(payment.amount.toString()) : 0);
  }, 0);
  
  return {
    customer_id: customer.customer_id,
    store_id: customer.store_id,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    address: address,
    active: customer.active === 1,
    create_date: new Date(customer.create_date),
    recent_rentals: recentRentals,
    lifetime_rentals: customerRentals.length,
    lifetime_value: NumberDecimal(lifetimeValue.toFixed(2)),
    last_update: new Date(customer.last_update)
  };
});

db.customers.insertMany(customersTransformed);
print(`✓ ${customersTransformed.length} clientes inseridos com rentals embedded\n`);

// Atualizar total_customers nas stores
db.stores.updateOne({ store_id: 1 }, { $set: { total_customers: customersTransformed.filter(c => c.store_id === 1).length }});
db.stores.updateOne({ store_id: 2 }, { $set: { total_customers: customersTransformed.filter(c => c.store_id === 2).length }});

// ============================================================================
// FASE 8: Transformar e inserir coleção RENTALS (com embeddings)
// ============================================================================

print("FASE 8: Inserção de alugueres com embeddings...");

const customerSummaryMap = new Map();
db.customers.find({}, { customer_id: 1, first_name: 1, last_name: 1, email: 1 }).forEach(cust => {
  customerSummaryMap.set(cust.customer_id, {
    customer_id: cust.customer_id,
    full_name: `${cust.first_name} ${cust.last_name}`,
    email: cust.email
  });
});

const rentalsTransformed = rentalsRaw.map(rental => {
  const invInfo = inventoryFilmMap.get(rental.inventory_id) || {};
  const filmInfo = filmMap.get(invInfo.film_id) || {};
  const customerInfo = customerSummaryMap.get(rental.customer_id) || {};
  const payment = paymentMap.get(rental.rental_id) || { payment_id: null, amount: NumberDecimal("0"), payment_date: null };
  
  const rentalDate = new Date(rental.rental_date);
  const returnDate = rental.return_date ? new Date(rental.return_date) : null;
  const durationDays = returnDate ? Math.ceil((returnDate - rentalDate) / (1000 * 60 * 60 * 24)) : null;
  
  return {
    rental_id: rental.rental_id,
    rental_date: rentalDate,
    inventory_id: rental.inventory_id,
    customer: customerInfo,
    film: filmInfo,
    store_id: invInfo.store_id || 1,
    staff_id: rental.staff_id,
    return_date: returnDate,
    payment: payment,
    rental_duration_days: durationDays,
    is_overdue: returnDate === null && (new Date() - rentalDate) > (7 * 24 * 60 * 60 * 1000), // >7 dias
    last_update: new Date(rental.last_update)
  };
});

db.rentals.insertMany(rentalsTransformed);
print(`✓ ${rentalsTransformed.length} alugueres inseridos com customer/film embedded\n`);

// Atualizar disponibilidade do inventário
const activeRentals = rentalsTransformed.filter(r => r.return_date === null);
activeRentals.forEach(rental => {
  db.inventory.updateOne(
    { inventory_id: rental.inventory_id },
    { 
      $set: { 
        available: false,
        current_rental_id: rental.rental_id
      }
    }
  );
});

print(`✓ Inventário atualizado: ${activeRentals.length} itens marcados como indisponíveis\n`);

// ============================================================================
// FASE 9: Criação de índices básicos (blueprint completo em queries/)
// ============================================================================

print("FASE 9: Criação de índices essenciais...");

db.films.createIndex({ film_id: 1 }, { unique: true });
db.films.createIndex({ "category.name": 1 });
db.films.createIndex(
  { title: "text", description: "text" }, 
  { 
    name: "film_search",
    default_language: "english",
    language_override: "none",
    weights: { title: 10, description: 1 }
  }
);

db.customers.createIndex({ customer_id: 1 }, { unique: true });
db.customers.createIndex({ email: 1 });

db.rentals.createIndex({ rental_id: 1 }, { unique: true });
db.rentals.createIndex({ "customer.customer_id": 1, rental_date: -1 });

db.inventory.createIndex({ inventory_id: 1 }, { unique: true });
db.inventory.createIndex({ film_id: 1, store_id: 1, available: 1 });

db.stores.createIndex({ store_id: 1 }, { unique: true });

print("✓ Índices essenciais criados\n");

// ============================================================================
// FASE 10: Estatísticas finais e validação
// ============================================================================

print("\n=== IMPORTAÇÃO CONCLUÍDA COM SUCESSO ===\n");

print("Estatísticas das coleções:");
print(`  - films:     ${db.films.countDocuments()} documentos`);
print(`  - customers: ${db.customers.countDocuments()} documentos`);
print(`  - rentals:   ${db.rentals.countDocuments()} documentos`);
print(`  - inventory: ${db.inventory.countDocuments()} documentos`);
print(`  - stores:    ${db.stores.countDocuments()} documentos`);

print("\nExemplos de consulta:");
print("  db.films.findOne({ title: /ACADEMY/ })");
print("  db.customers.findOne({ customer_id: 1 })");
print("  db.rentals.find({ 'customer.customer_id': 1 }).limit(5)");

print("\nPróximos passos:");
print("  1. mongosh queries/index_blueprint.mongosh.js  (índices otimizados)");
print("  2. mongosh tests/data_quality.mongosh.js       (validação)");
print("  3. mongosh queries/01_*.mongosh.js             (queries de negócio)");

print("\n===========================================\n");
