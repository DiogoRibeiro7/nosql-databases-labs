# Porto Night Markets – Final Project Example (mongosh only)

This sample solution demonstrates how a final project submission can look when the entire workflow (data import, analyses, validations) is implemented with pure mongosh scripts. It tracks the performance of rotating food vendors that participate in Porto's summer street markets.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `import_data.mongosh.js` | Bootstrap script that wipes/creates the `group_xx_example_final` database and loads inline sample data. |
| `architecture.md` | Written rationale for the collections, embedding strategy, and indexes. |
| `performance.md` | Notes on query patterns, index coverage, and manual explain output. |
| `data/` | JSON copies of the inline fixtures for documentation or slide decks. |
| `queries/0*_*.mongosh.js` | Thirteen mongosh scripts that mix `find()` examples with richer aggregation pipelines. |
| `queries/index_blueprint.mongosh.js` | Idempotent script that recreates indexes if you ever drop them manually. |
| `tests/data_quality.mongosh.js` | Lightweight assertions to verify document counts and denormalized fields. |
| `advanced/` | Optional demos for aggregation performance tuning and change streams. |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_10/project

# 1. Seed the database with nothing but mongosh
mongosh import_data.mongosh.js

# 2. Explore the curated use cases (run any file you need)
