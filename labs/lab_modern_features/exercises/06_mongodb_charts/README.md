# Exercise 06 · MongoDB Charts Prep

Model datasets and aggregation pipelines that power MongoDB Charts dashboards (or any BI/export workflow).

## Goals

1. Generate curated sales/analytics datasets from raw lab collections.
2. Produce chart-ready views (time-series rollups, funnel stages, regional breakdowns).
3. Export JSON/CSV snapshots for sharing with Charts, Tableau, or downstream services.

## Files

| File          | Purpose                                                              |
| ------------- | -------------------------------------------------------------------- |
| `starter.js`  | Scaffolding for drafting your own aggregation pipelines and exports. |
| `solution.js` | Complete walkthrough invoked via `npm run charts`.                   |
| `test.js`     | Confirms the solution exposes the expected helper methods.           |

## Workflow

1. Run `node setup/initialize_data.js` to load the `sales_summary` dataset referenced in the solution.
2. Build additional dashboards in `starter.js` by composing `$group`, `$bucket`, `$lookup`, etc.
3. Extend `test.js` with assertions around generated dataset sizes once your pipelines solidify.
