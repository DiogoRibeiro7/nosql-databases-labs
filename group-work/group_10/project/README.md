# Sistema de Videoclube – Projeto Final (mongosh only)

Este projeto demonstra como deve ser estruturada e documentada uma submissão final totalmente baseada em scripts **mongosh**, sem Node.js.  
Implementa um sistema de gestão de videoclube com clientes, filmes, lojas e alugueres, incluindo validação de dados, agregações analíticas e otimização de performance com índices.

## ## Deliverables in This Folder

| Path | Purpose |
| ------ | --------- |
| `import_data.mongosh.js` | Bootstrap script that wipes/creates the `group_xx_example_final` database and loads inline sample data. |
| `architecture.md` | Written rationale for the collections, embedding strategy, and indexes. |
| `performance.md` | Notes on query patterns, index coverage, and manual explain output. |
| `data/` | JSON copies of the inline fixtures for documentation or slide decks. |
| `queries/0*_*.mongosh.js` | Thirteen mongosh scripts that mix `find()` examples with richer aggregation pipelines. |
| `queries/index_blueprint.mongosh.js` | Idempotent script that recreates indexes if you ever drop them manually. |
| `tests/data_quality.mongosh.js` | Lightweight assertions to verify document counts and denormalized fields. |
| `advanced/` | Optional demos for aggregation performance tuning and change streams. |

---

## Como Correr Tudo (MongoDB Local)

```bash
cd group-work/group_10/project

# 1. Criar e popular a base de dados
mongosh import_data.mongosh.js

``


# Exemplo: faturação total por loja
mongosh queries/01_receita_por_loja_e_filme.mongosh.js


