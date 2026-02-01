# Architecture & Data Model — FoodFinder

## Domain Snapshot
O sistema precisa responder a perguntas como:

1. Quais tipos de comida têm melhor desempenho (rating médio).

2. Quais zonas (outcodes) concentram mais restaurantes.

3. Quais restaurantes são mais populares com base em reviews e favoritos.

O domínio combina dados estáticos (restaurantes) com dados dinâmicos (reviews e favoritos).

## Collections

| Collection   | Role                     | Notes |
|--------------|---------------------------|-------|
| `restaurants` | Reference/master data     | Dados estáveis do dataset original; usados como base para todas as relações e análises. |
| `reviews`     | Fact/telemetry            | Cada documento representa uma avaliação de um utilizador; crescimento ilimitado; suporta médias, contagens e rankings. |
| `favorites`   | Relationship (many‑to‑many) | Liga utilizadores a restaurantes favoritos; permite medir popularidade e preferências. |


### Schema Highlights
```javascript

// restaurants

{
  _id: ObjectId("55f14312c7447c3da7051b26"),
  name: ".CN Chinese",
  address: "228 City Road",
  address_line_2: "Cardiff",
  outcode: "CF24",
  postcode: "3JH",
  rating: 5,                     // numeric or "Not yet rated"
  type_of_food: "Chinese",
  URL: "http://www.just-eat.co.uk/restaurants-cn-chinese-cardiff/menu"
}

// reviews

{
  _id: ObjectId(),
  restaurantId: ObjectId("55f14312c7447c3da7051b26"),   // reference to restaurants._id
  user: "Miguel",
  rating: 4,
  comment: "Boa comida, entrega rápida!",
  createdAt: ISODate("2026-01-23T10:00:00Z")
}

//favorites

{
  _id: ObjectId(),
  user: "Miguel",
  restaurantId: ObjectId("55f14312c7447c3da7051b26"),   // reference to restaurants._id
  createdAt: ISODate("2026-01-23T10:05:00Z")
}
```
