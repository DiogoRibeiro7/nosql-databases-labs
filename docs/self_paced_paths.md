# Self-Paced Learning Paths

Use these tracks to plan your progress through the repository. Each path builds on previous labs and highlights the relevant documentation/tests.

---

## 1. Core Curriculum (Weeks 1–5)

| Week | Lab | Focus | Key Files |
| --- | --- | --- | --- |
| 1 | `lab01_intro` | MongoDB setup, CRUD, indexes | `import_data.js`, `test_lab01.js` |
| 2 | `lab02_modeling` | Data modeling, embedding vs referencing | `model.md`, `run_all_tests.js` |
| 3 | `lab03_queries` | Advanced queries, aggregations, indexing | `queries.js`, `test_data_integrity.js`, `test_lab03_performance.js` |
| 4 | `lab04_aggregation` | Analytics pipelines, window functions | `aggregation_*.js`, `test_lab04.js` |
| 5 | `lab05_replication` | Replica sets, failover, monitoring | `setup_replica_set.js`, `simulate_failover.js`, `monitor_replication.js` |

**Checkpoint**: Run `npm run test:labs` to validate Labs 01–04 and review replication notes for Lab 05.

---

## 2. Advanced Tracks

### 2.1. Indexing & Performance
- `lab02_modeling/performance_benchmarks.js`
- `lab03_queries/test_lab03_performance.js`
- `docs/query_optimization.md`

### 2.2. Aggregation & Analytics
- `lab04_aggregation/aggregations_*.js`
- `lab04_aggregation/test_lab04.js`
- `docs/performance_expectations.md` (Lab 04 section)

### 2.3. Replication & Operations
- `lab05_replication/setup_replica_set.js`
- `lab05_replication/monitor_replication.js`
- `lab05_replication/write_concerns.js`

---

## 3. Modern MongoDB Features

After the core labs, explore `labs/lab_modern_features/`:
- **Change Streams** (requires replica set)
- **Time-Series Collections**
- **Atlas Search & Vector Search** (Atlas optional, local fallbacks provided)
- **GridFS**
- **MongoDB Charts data prep**

Run all exercises with:
```bash
cd labs/lab_modern_features
node run_all_exercises.js
```

---

## 4. Optional Labs & Projects

| Area | Folder | Highlights |
| --- | --- | --- |
| Transactions | `lab_extra/lab_extra_01_transactions` | Multi-document transactions, saga patterns |
| Sharding | `lab_extra/lab_extra_02_sharding` | Cluster setup, zone sharding |
| Indexing | `lab_extra/lab_extra_03_indexing` | Comprehensive index strategies |
| Group Projects | `group-work/` | Collaborative submissions, validator scripts |

---

## 5. Suggested Timeline

1. Weeks 1–5: Core labs (one per week)
2. Week 6: Choose an advanced track + corresponding extra lab
3. Week 7+: Modern features lab, group project deliverables, or optional extensions

Keep notes in each lab’s `NOTES.md` and reference `docs/testing_framework.md` for automated checks. Use GitHub Issues/Discussions to ask questions or share findings as you progress.
