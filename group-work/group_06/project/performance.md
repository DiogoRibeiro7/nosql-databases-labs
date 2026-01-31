# Performance Considerations

## Overview

Performance concerns stay lightweight: the dataset is small (JSON exports under `project/data/`), so we focus on sensible indexing and lean queries rather than heavy benchmarking. Every script keeps projections minimal and filters early to avoid unnecessary document volume.

## Indexes and their usage

- `visits` – a compound index on `{ department: 1, visit_date: -1 }` supports queries that filter or sort visits by department and date. It backs the aggregation that counts visits per department (`07_visits_by_department_with_index.mongosh.js`) and also benefits the read helpers that page recent visits for specific departments.
- `patients` – an index on `medical_history.chronic_conditions` accelerates chronic-condition lookups used in `02_chronic_patients_by_condition.mongosh.js`, keeping the chronic-care dashboard snappy without scanning the entire collection.

Both indexes are created explicitly by `10_visit_indexes.mongosh.js`, ensuring subsequent scripts rely on them without manual setup.

## Impact and justification

Adding these indexes keeps the most frequent filters fast: the department/date index avoids full scans when grouping visits, while the chronic-conditions index limits the scope of the chronic-patient query. Because the workload is read-heavy (lists, dashboards, aggregations), the indexes improve result latency while keeping the scripts simple.

## Limitations

The project intentionally avoids complex load testing—volumes are limited to the provided JSON files and the focus is on transparent, reproducible `mongosh` scripts. The documented indexes deliver measurable benefits within this context without introducing operational overhead. Continuous benchmarking or large-scale sharding was out of scope for this submission.
