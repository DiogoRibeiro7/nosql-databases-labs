# Lab 04 – Advanced Aggregation Challenges

Push beyond the required pipelines with these optional exercises. They encourage production-style analytics, performance tuning, and reusable pipeline tooling.

---

## Advanced Exercise 1: Sliding-Window Health Monitor

**Goal:** leverage window functions to detect anomalies in sales velocity.

### Tasks
1. Build a pipeline that:
   - Groups sales by day.
   - Computes 7-day moving averages and standard deviation using `$setWindowFields`.
   - Emits alerts when the day’s revenue deviates by >2σ from the moving average.
2. Persist the alerts into a `sales_alerts` collection using `$merge`.
3. Document how you would schedule this pipeline (e.g., cron + `mongosh`, Atlas trigger).

**Deliverables:** pipeline saved to `aggregation_window_health.js` plus notes in `NOTES.md`.

---

## Advanced Exercise 2: Reusable Pipeline Library

**Goal:** avoid copy/paste by building small, composable pipeline snippets.

### Tasks
1. Create `pipeline_library/` with modules such as:
   - `projection.js` – reusable `$project` objects for customer/product fields.
   - `lookup_helpers.js` – functions that return `$lookup` stages with parameters.
   - `filters.js` – functions for date-range `$match` conditions.
2. Demonstrate usage in a script `run_pipeline.js` that imports these helpers, builds a complex pipeline, and prints results.
3. Explain how this structure improves maintainability (include in `NOTES.md`).

---

## Advanced Exercise 3: Aggregation Benchmark Harness

**Goal:** measure how pipeline changes affect performance.

### Tasks
1. Write `benchmark_pipelines.js` that:
   - Runs at least three pipelines (baseline, optimized, experimental).
   - Captures `executionStats` via `.explain("executionStats")`.
   - Logs metrics (time, docs examined, memory usage where available) to JSON/CSV under `benchmarks/`.
2. Run the harness before and after applying optimizations (e.g., new indexes, reordered stages) and compare metrics.
3. Summarize findings in `benchmarks/README.md`.

---

## Reporting

Add an **“Advanced Exercises Dashboard”** section to `labs/lab04_aggregation/NOTES.md` describing:

- Which exercises you attempted
- Commands to run the scripts
- Key metrics or alerts produced

Clarity of documentation matters more than perfect code; partial implementations are still valuable if you describe next steps.
