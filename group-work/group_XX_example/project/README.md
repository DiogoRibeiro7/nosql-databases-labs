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
cd group-work/group_XX_example/project

# 1. Seed the database with nothing but mongosh
mongosh import_data.mongosh.js

# 2. Explore the curated use cases (run any file you need)
mongosh queries/01_revenue_by_event_vendor.mongosh.js
mongosh queries/02_repeat_visitors.mongosh.js
mongosh queries/03_neighborhood_heatmap.mongosh.js
mongosh queries/04_hourly_ops_pulse.mongosh.js
mongosh queries/05_vendors_by_tier.mongosh.js
mongosh queries/06_events_by_neighborhood.mongosh.js
mongosh queries/07_recent_high_value_orders.mongosh.js
mongosh queries/08_vendor_event_presence.mongosh.js
mongosh queries/09_payment_mix_by_event.mongosh.js
mongosh queries/10_feedback_distribution_by_vendor.mongosh.js
mongosh queries/11_vendor_waittime_trends.mongosh.js
mongosh queries/12_vendor_revenue_rankings.mongosh.js
mongosh queries/13_returning_customers_by_district.mongosh.js
mongosh queries/14_revenue_with_explain.mongosh.js
mongosh queries/15_orders_collection_stats.mongosh.js

# 3. Re-apply indexes if you changed anything (optional)
mongosh queries/index_blueprint.mongosh.js

# 4. Run the sanity checks before committing
mongosh tests/data_quality.mongosh.js

# 5. Explore the advanced demos (optional)
mongosh advanced/aggregation_performance.mongosh.js
mongosh advanced/approximate_metrics.mongosh.js
```

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you point mongosh at another URI, export `MONGODB_URI` before running the commands.

## Scenario Summary

- **Business driver:** Porto's economic development office needs timely insight into which vendors deserve prime locations, which events drive repeat visitors, and where to invest in operational improvements.
- **Key entities:** `vendors` (reference data), `events` (embedded venue metadata), `orders` (observational facts enriched with customer segments).
- **Why mongosh only?** Reproducing grading artifacts should never require installing driver dependencies. Each script is idempotent and interacts with the DB through standard mongosh helpers such as `cat()`, `insertMany()`, and aggregation pipelines.

## Suggested Presentation Flow

1. Open the README and showcase the import/analysis commands.
2. Walk through the diagrams inside `architecture.md` (copy/paste them into slides if presenting live).
3. Run `queries/use_cases.mongosh.js` and discuss the printed summary tables.
4. Mention how `performance.md` justifies the indexes that `queries/index_blueprint.mongosh.js` applies.
5. Close with lessons learned and potential extensions (e.g., streaming dashboards, faster approximations). The `advanced/` folder has starter scripts you can reference when discussing those ideas.
