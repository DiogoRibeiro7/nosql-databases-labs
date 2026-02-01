# Group 13 – Porto Night Markets Analysis (mongosh only)

This project demonstrates a complete MongoDB analysis workflow for Porto's rotating food vendors at summer street markets. The entire solution is implemented with pure mongosh scripts—no external drivers or ORMs required.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `import_data.mongosh.js` | Bootstrap script that wipes/creates the `group_13_markets` database and loads inline sample data. |
| `architecture.md` | Written rationale for collections, embedding strategy, and index design. |
| `performance.md` | Query patterns, index coverage analysis, and manual explain output from 20 queries. |
| `data/` | JSON copies of inline fixtures for documentation or presentations. |
| `queries/01_*.mongosh.js` to `queries/20_*.mongosh.js` | Twenty mongosh scripts covering revenue analysis, visitor loyalty, geographic insights, and operational metrics. |
| `queries/index_blueprint.mongosh.js` | Idempotent script to recreate indexes if needed. |
| `tests/data_quality.mongosh.js` | Lightweight assertions to verify document counts and denormalized fields. |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_13/project

# 1. Seed the database with mongosh
mongosh import_data.mongosh.js

# 2. Create all indexes
mongosh queries/index_blueprint.mongosh.js

# 3. Run the 20 analytical queries
mongosh queries/01_revenue_by_event_vendor.mongosh.js
mongosh queries/02_repeat_visitors.mongosh.js
mongosh queries/03_neighborhood_heatmap.mongosh.js
mongosh queries/04_hourly_ops_pulse.mongosh.js
# ... (continue through query 20)

# 4. Verify data quality before submission
mongosh tests/data_quality.mongosh.js

# 5. Profile slow queries (optional but recommended)
mongosh performance_profiling.mongosh.js
```

The scripts assume MongoDB is available at `mongodb://127.0.0.1:27017`. To use a different URI, export `MONGODB_URI` before running.

## Scenario Summary

- **Business driver:** Porto's economic development office needs insight into vendor performance, repeat customer patterns, neighborhood demand, and operational efficiency across rotating street markets.
- **Key entities:** `vendors` (reference data), `events` (market schedule with venue metadata), `orders` (transaction facts enriched with customer segments).
- **Why mongosh only?** Grading reproducibility requires zero external dependencies. Each script is idempotent and uses standard mongosh helpers (`cat()`, `insertMany()`, aggregation pipelines).

## Project Structure

**3 Collections, 20 Queries:**

1. **Revenue & Satisfaction** – Sales by event/vendor, payment methods, feedback distribution
2. **Loyalty & Repeat Visitors** – Customer segmentation, visit frequency, geographic patterns
3. **Operational Metrics** – Wait times, vendor rankings, hourly service pulses, neighborhood heatmaps

## Suggested Presentation Flow

1. Open this README and showcase the import/analysis workflow.
2. Walk through `architecture.md` diagrams (embed in slides if presenting).
3. Run a sample query from `queries/` and explain the aggregation pipeline.
4. Reference `performance.md` to justify index choices in `queries/index_blueprint.mongosh.js`.
5. Discuss data quality checks from `tests/data_quality.mongosh.js`.
6. Close with lessons learned and scaling considerations.

---

**Last updated:** January 22, 2026  
**Group:** 13  
**Course:** NoSQL Databases Laboratory
