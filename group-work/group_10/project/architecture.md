
# Arquitetura do Projeto Videoclube

## Base de Dados
**Nome:** `videoclube`

## Coleções
- **films**
  - Campos: title (string), releaseYear (int), rentalRate (double)
  - Índices: { title: "text" }
  - Validator: título obrigatório, preço ≥ 0

- **customers**
  - Campos: firstName, lastName, email, active
  - Índices: email único
  - Validator: email com regex, active booleano

- **inventory**
  - Campos: filmId (ObjectId), format (enum), status (enum)
  - Índices: filmId, status
  - Validator: format ∈ [DVD, BluRay, Digital]

- **rentals**
  - Campos: inventoryId, filmId, customerId, rentalDate, dueDate, status
  - Índices: customerId+rentalDate, status
  - Validator: datas coerentes, amount ≥ 0

## Relacionamentos
- inventory → films (filmId)
- rentals → inventory (inventoryId)
- rentals → customers (customerId)

## Decisões
- Separação de `inventory` para evitar arrays crescentes
- Validators para garantir integridade
