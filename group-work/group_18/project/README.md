# Plataforma de Descoberta de Restaurantes

## Descrição
Permite:
- Listar restaurantes
- Filtrar por tipo de comida e rating
- Adicionar reviews
- Marcar restaurantes como favoritos
- Gerar estatísticas (top restaurantes, média de ratings, etc.)

## Dataset utilizado
- Ficheiro: `restaurant.json`
- Localização: `group-work/group_18/project/data/restaurant.json`
- Origem: pasta `data/datasets/restaurant.json` do repositório do professor

## Coleções
- `restaurants` — dados base dos restaurantes (dataset original)
- `reviews` — avaliações de utilizadores
- `favorites` — restaurantes marcados como favoritos por utilizadores

## Como preparar a base de dados

1. Iniciar o MongoDB (local ou Atlas).
2. Importar o dataset de restaurantes:

```bash
mongoimport --db foodfinder --collection restaurants --file group-work/group_05/project/data/restaurant.json --jsonArray
