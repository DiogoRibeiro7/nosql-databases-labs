# Sistema de Videoclube – Projeto Final (mongosh only)

Este projeto demonstra como deve ser estruturada e documentada uma submissão final totalmente baseada em scripts **mongosh**, sem Node.js.  
Implementa um sistema de gestão de videoclube com clientes, filmes, lojas e alugueres, incluindo validação de dados, agregações analíticas e otimização de performance com índices.

## Deliverables in This Folder

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

## Como executar (MongoDB Local)

```bash
cd group-work/group_10/project

# 1. Criar e adicionar a base de dados
mongosh import_data.mongosh.js

``

mongosh queries/01_receita_por_loja_e_filme.mongosh.js
mongosh queries/01_receita_por_loja_e_filme.mongosh.js 
mongosh queries/02_clientes_mais fieis.mongosh.js
mongosh queries/03_encontrar_loja_mais_próxima_um_ponto.mongosh.js
mongosh queries/04_Receita por ano de lançamento.mongosh.js
mongosh queries/05_filme_mais_rentavel.mongosh.js 
mongosh queries/06_Receita por cliente por loja.mongosh.js 
mongosh queries/07_historioco_de_aluguer_por_cliente.mongosh.js 
mongosh queries/08_alugueres_por_estado.mongosh.js 
mongosh queries/09_receita_mensal.mongosh.js 
mongosh queries/10_filmes_mais_recentes_alugados_em_cada_loja.mongosh.js 
mongosh queries/11_filmes_por_intervalo_de_preço.mongosh.js 
mongosh queries/12_clientes_com_alugueres_atraso.mongosh.js 
mongosh queries/13_clientes_inativos_antes_2025.mongosh.js 
mongosh queries/14_filmes_por_faixa_preco.mongosh.js 
mongosh queries/15_pesquisa_por_palavra_chave_films.mongosh.js 
mongosh queries/16_estatisticas_globais_films.mongosh.js 
mongosh queries/17_tendencia_alugueres_dias.mongosh.js


