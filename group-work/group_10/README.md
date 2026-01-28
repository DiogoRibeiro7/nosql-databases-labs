# Grupo 10 — Projeto Final NoSQL (MongoDB)

## Membros

- Gerson Castro  40220397
- Paulo Santos 40220394

## Descrição

Este projeto implementa um sistema  gestão de videoclube, com 4 coleções principais:

- `customers`  
- `films`  
- `stores`  
- `rentals`  



Inclui:
- Modelação document-based
- Dados reais pré-carregados
- Schemas com validadores JSON
- Indexes pensados para performance
- Queries (CRUD + Aggregation)



## Como correr o projeto

1. Abrir o terminal:
```bash
cd group-work/group_10/project

mongosh 

# 1. Criar e adicionar a base de dados
mongosh load("import_data.mongosh.js")


mongosh project/queries/05_top_films_aggregation.mongosh.js
