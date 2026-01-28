## Overview

The project is deliberately light: all data lives as JSON exports under `data/`, and the scripts that run against it are plain `mongosh` files in `project/queries`. Each query is short, documented in place, and focused on a single task so the flow stays easy to read and rerun.

## Directory structure

- `data/` – contains the three source collections (`patients.json`, `visits.json`, `lab_results.json`) that back the queries.
- `project/queries/` – twelve numbered scripts (`01_...` through `12_...`) covering CRUD, aggregations, read helpers, and index setup; each script runs directly in `mongosh`.
- Markdown docs (`README.md`, `solution.md`, `architecture.md`) describe the goals, query catalogue, and architecture for external reviewers.

## Collections in the system

- **patients** – holds demographics, contact channels, and chronic-history arrays. Queries filter by age, gender, and chronic conditions to support patient cohorts.
- **visits** – records encounter metadata (department, provider, vital signs, procedures, prescriptions, follow-up flags). Scripts read recent visits, flag hypertension, and inspect prescription usage.
- **lab_results** – contains test identifiers, patient references, codes, results, and abnormal flags. Queries upsert new results and retrieve the latest entries per patient.

Each collection reflects a coherent slice of clinical data and is accessed directly from the `project/queries` scripts.

## Query organization

- The scripts are numbered `01` through `12`, keeping their order clear and easy to cite.
- **CRUD:** includes inserting a new patient, updating contact details, removing inactive records, and upserting lab results.
- **Aggregations:** two pipelines answer reporting questions about Lisbon patients and visit counts per department.
- **Read helpers:** follow-up queries deliver recent visits, `Lisinopril` prescriptions, and the latest three lab results per patient.
- **Indexes:** `10_visit_indexes` builds the compound `department + visit_date` and `medical_history.chronic_conditions` indexes that the other scripts rely on.

## Index usage

- The `department + visit_date` compound index keeps visit queries efficient when filtering or sorting by department and time.
- The `medical_history.chronic_conditions` index supports chronic-care lookups used by the relevant scripts.

Both indexes are created explicitly so the read-focused queries can lean on them without extra setup.

## Data flow

1. Every script opens `medical_database` and works on the JSON-based collections in `data/`.
2. Queries filter and project only the fields they need; aggregations group and sort before printing results.
3. Mutations (insert, update, delete, upsert) are guarded with specific filters so they touch only the intended documents.
4. The indexes keep frequent lookups fast, which makes the execution path straightforward and reproducible.

This keeps the architecture simple: no external layers, just MongoDB shell scripts reading the same collections exposed in the repo.
