# Group 13 – Porto Night Markets (Complete Project Submission)

This folder contains the complete deliverables for Group 13's NoSQL databases laboratory work, following the project guidelines in `group-work/instructions/project_guidelines.md`.

- 📂 `project/` – fully working MongoDB analysis implementation with 20 optimized queries covering Porto's rotating food vendors at summer street markets.
- 🧠 Focus – all functionality implemented within mongosh scripts (no external drivers or ORMs).
- ✅ Complete benchmark for folder layout, documentation standards, and comprehensive query coverage across 4 primary analytical domains.

## Quick Start

1. **Bootstrap the dataset:**
   ```bash
   mongosh project/import_data.mongosh.js
   ```

2. **Create indexes:**
   ```bash
   mongosh project/queries/index_blueprint.mongosh.js
   ```

3. **Execute analytical queries:**
   Run scripts in `project/queries/` to explore the analysis:
   - Revenue and satisfaction metrics by `eventCode` × `vendorId`
   - Repeat visitor detection grouped by `customer.customerId`
   - Neighborhood heatmaps grouped by `customer.district`
   - Rolling-hour service metrics bucketed by `createdAt`

## Project Structure

| Path | Purpose |
| ---- | ------- |
| `project/import_data.mongosh.js` | Bootstrap script that loads 34 fixture orders (scales to tens of thousands) |
| `project/architecture.md` | Written rationale for collections, embedding strategy, and index design |
| `project/performance.md` | Query patterns, index coverage analysis, and explain output from 20 queries |
| `project/data/` | JSON copies of fixtures for documentation or presentations |
| `project/queries/01_*.mongosh.js` to `project/queries/20_*.mongosh.js` | Twenty mongosh scripts covering revenue analysis, visitor loyalty, geographic insights, and operational metrics |
| `project/queries/index_blueprint.mongosh.js` | Idempotent script to recreate indexes if needed |
| `project/tests/data_quality.mongosh.js` | Lightweight assertions to verify document counts and denormalized fields |

## Scenario Overview

**Business driver:** Porto's economic development office needs timely insight into:
- Which vendors deserve prime locations based on revenue performance
- Which events drive repeat visitors and neighborhood loyalty
- Where to invest in operational improvements (wait times, service quality)

**Key entities:**
- `vendors` – reference data with operational capacity and partnership tier
- `events` – market schedule with embedded venue metadata
- `orders` – transaction facts enriched with customer segments and satisfaction ratings

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_13

# 1. Seed the database with mongosh
mongosh project/import_data.mongosh.js

# 2. Create all indexes
mongosh project/queries/index_blueprint.mongosh.js

# 3. Run the 20 analytical queries
mongosh project/queries/01_revenue_by_event_vendor.mongosh.js
mongosh project/queries/02_repeat_visitors.mongosh.js
mongosh project/queries/03_neighborhood_heatmap.mongosh.js
mongosh project/queries/04_hourly_ops_pulse.mongosh.js
# ... (continue through query 20)

# 4. Verify data quality before submission
mongosh project/tests/data_quality.mongosh.js

# 5. Profile slow queries (optional but recommended)
mongosh project/performance_profiling.mongosh.js
```

The scripts assume MongoDB is available at `mongodb://127.0.0.1:27017`. To use a different URI, export `MONGODB_URI` before running.

## Why mongosh Only?

- **Reproducibility:** No external driver dependencies simplifies grading and eliminates environment setup friction.
- **Idempotency:** All scripts use drop-and-recreate patterns; index recreation and data reloads are always safe.
- **Clarity:** Aggregation pipelines are readable inline; no ORM abstraction obscures the actual MongoDB operations.

## Suggested Presentation Flow

1. Open this README and showcase the import/analysis workflow.
2. Walk through `project/architecture.md` diagrams (embed in slides if presenting).
3. Run a sample query from `project/queries/` and explain the aggregation pipeline.
4. Reference `project/performance.md` to justify index choices in `project/queries/index_blueprint.mongosh.js`.
5. Discuss data quality checks from `project/tests/data_quality.mongosh.js`.
6. Close with lessons learned and scaling considerations.

---

**Last updated:** January 22, 2026  
**Group:** 13  
**Course:** NoSQL Databases Laboratory  
**Status:** Complete & Ready for Review