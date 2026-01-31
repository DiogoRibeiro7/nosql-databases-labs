# Testes do Sistema – Healthcare Patient Records

Este diretório contém testes simples em `mongosh` para validar:

- Integridade dos dados inseridos
- Relações entre coleções
- Execução correta das queries principais
- Consistência do modelo de dados

Os testes são executados diretamente no MongoDB Atlas, sem Node.js ou frameworks externos.

## Como executar

```bash

mongosh "mongodb+srv://teste:teste123@cluster0.uxzs8d5.mongodb.net/healthcare" project/tests/data_quality.mongosh.js
mongosh "mongodb+srv://teste:teste123@cluster0.uxzs8d5.mongodb.net/healthcare" project/tests/queries_tests.mongosh.js

```
