# Advanced Variants

These examples extend the baseline mongosh project with optional, instructor-led demos. They are not required for regular labs but help students reason about performance tuning and streaming features.

| File | Description |
| ---- | ----------- |
| `aggregation_performance.mongosh.js` | Runs a representative aggregation twice (covered vs uncovered) and prints `executionStats` plus tuning tips. |
| `approximate_metrics.mongosh.js` | Demonstrates how to use `$facet`, `$bucketAuto`, and `$group` to produce fast summary metrics without extra infrastructure. |

> Run both scripts from `group-work/group_XX_example/project/` after seeding the database with `mongosh import_data.mongosh.js`.
