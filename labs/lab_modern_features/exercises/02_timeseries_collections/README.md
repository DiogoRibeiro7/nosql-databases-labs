# Exercise 02 · Time-Series Collections

Design optimized collections for timestamped data (IoT, financial, monitoring) and practice queries and window functions.

## Goals
1. Create time-series collections with proper time/meta fields and TTL windows.
2. Ingest batches of synthetic events representing sensors, stocks, and metrics.
3. Run analytics using `$match`, `$group`, `$setWindowFields`, and percentile operators.

## Files
| File | Purpose |
| --- | --- |
| `starter.js` | Boilerplate for connecting and creating your own pipelines. |
| `solution.js` | Completed walkthrough invoked via `npm run time-series`. |
| `test.js` | Basic sanity check that ensures your class exposes the expected hooks. |

## Workflow
1. Seed baseline data with `node setup/initialize_data.js` (optional but recommended).
2. Implement algorithms in `starter.js`, or inspect `solution.js` for guidance.
3. Update `test.js` with custom aggregation checks once you have data models in place.
4. Run `node exercises/02_timeseries_collections/test.js` before committing.*** End Patch*** End Patch
