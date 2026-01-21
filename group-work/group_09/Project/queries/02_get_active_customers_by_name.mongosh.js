// Mostra os clientes ativos, ordenados por primeiro e último nome
// Correr: mongosh queries/02_get_active_customers_by_name.mongosh.js

db = db.getSiblingDB("sakila");
print("Lista de clientes ativos (ordenados por nome):");
db.customer
	// Filtrar por ativos e depois tirar o primeiro e ultimo nome apenas
	.find(
		{ active: 1 },
		{ _id: 0, first_name: 1, last_name: 1 }
	)
	.limit(10)
	.sort({ first_name: 1, last_name: 1 })
	.forEach((customer) => printjson(customer))