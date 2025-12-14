# Exercise 03 · Atlas Search

Build full-text experiences with MongoDB Atlas Search (or emulate them locally with standard aggregation stages).

## Goals
1. Prepare catalog/blog datasets and create Atlas Search indexes.
2. Implement text, autocomplete, and facet queries with sort/highlight metadata.
3. Compare Atlas Search pipelines against local `$text` queries when Atlas is not available.

## Files
| File | Purpose |
| --- | --- |
| `starter.js` | Minimal harness for connecting to Atlas/local MongoDB and building pipelines. |
| `solution.js` | Full walkthrough executed by `npm run atlas-search`. |
| `test.js` | Ensures the exported class structure matches the lab instructions. |

## Workflow
1. Populate data via `node setup/initialize_data.js` (products + articles).
2. If using Atlas, define search indexes through the UI or Atlas CLI—see README for sample definitions.
3. Run `node starter.js` or the solution script to explore search operators.
4. Update `test.js` with validations for your Atlas Search outputs (e.g., verifying highlight snippets).*** End Patch*** End Patch
