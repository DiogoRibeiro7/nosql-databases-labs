# Lab Performance Expectations

This guide outlines the baseline throughput and latency targets for each core lab. Use it to validate your setup before attempting stretch goals or running the automated tests. Numbers assume a modern laptop (8+ GB RAM, SSD) running MongoDB locally or via Docker.

---

## Lab 01 – Introduction to NoSQL

| Area             | Expectation                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Dataset size     | `sample.json` (~5 documents, <10 KB)                                                             |
| Import time      | < 1s using `mongoimport`                                                                         |
| CRUD latency     | `findOne()` and `insertOne()` should return in < 5ms                                             |
| Index impact     | Adding a single-field index on `city` should reduce `find({city})` `executionTimeMillis` to ~1ms |
| Setup validation | `test_setup.js` completes in < 5s                                                                |

Tips:

- Run the warm-up queries in `BASIC_EXERCISES.md` to confirm the numbers.
- If latencies exceed the targets, verify that the MongoDB daemon is not running inside a throttled VM.

---

## Lab 02 – Data Modeling

Although Lab 02 focuses on schema reasoning, the starter data (`starter/data/*.json`) is provided to benchmark your assumptions.

| Dataset          | Document count | Notes                              |
| ---------------- | -------------- | ---------------------------------- |
| `customers.json` | 3              | one record per persona             |
| `orders.json`    | 4              | includes nested line items         |
| `products.json`  | 4              | referenced by orders/reviews       |
| `reviews.json`   | 6              | cross-links customers and products |

Target checks:

- Loading the full starter dataset into MongoDB should take < 2s.
- Sample queries in `queries.md` should examine ≤ the number of returned documents (covered query goal).
- Any proposed index must keep `executionTimeMillis` under 5ms on the starter data; extrapolate for production volumes in your write-up.

---

## Lab 03 – Advanced Queries

A detailed breakdown already lives in `labs/lab03_queries/PERFORMANCE_EXPECTATIONS.md`. Highlights:

- `movies` collection: 50 docs (baseline), expect COLLSCAN < 10ms, indexed queries ~1ms.
- Performance harness (`test_lab03_performance.js`) should finish in < 30s with all recommended indexes applied.
- Query optimization write-ups must report `executionTimeMillis`, `totalDocsExamined`, and speedup percentages.

Use the dedicated file for exact numbers per task; reference it from your `NOTES.md` deliverable.

---

## Lab 04 – Aggregation Pipeline

| Area              | Expectation                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| Dataset sizes     | `sales` 200 docs, `customers` 50 docs, `products` 30 docs                                         |
| Baseline pipeline | 3–4 stage pipeline should run in < 150ms                                                          |
| Window functions  | Moving-average pipeline (< 12 stages) should run in < 400ms                                       |
| Lookup cost       | Joining `sales` → `products` should not exceed `totalDocsExamined = 200` when `$match` runs first |
| Benchmark harness | `benchmark_pipelines.js` (if implemented) records metrics to JSON in < 5s                         |

If a pipeline exceeds these targets, profile stage-by-stage with `.explain("executionStats")` and ensure indexes exist on `$lookup` and `$match` fields.

---

## Lab 05 – Replication

| Scenario             | Expectation                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Replica setup        | `setup_replica_set.*` should spin up a 3-node RS in < 60s                                       |
| Write acknowledgment | `w: majority` writes complete in < 20ms under light load                                        |
| Failover             | Forced `rs.stepDown(10)` produces a new primary within 15–20s                                   |
| Replication lag      | Under normal load, `rs.printSlaveReplicationInfo()` reports lag < 2s                            |
| Read preference      | Switching to `secondaryPreferred` should show queries routed to secondaries with latency < 15ms |

Capture these measurements in the “Advanced Replication Runbook” section of `NOTES.md`, especially if you perform chaos or watchdog exercises.

---

## Keeping the Document Current

- When datasets change in size, update the counts above and note the commit hash in this file.
- If you add a new lab or optional track, append a section here and cross-link it from the relevant README.
- Performance regressions discovered in CI should reference this document when determining pass/fail thresholds.
