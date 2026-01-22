# Group 06 – MongoDB Solution Summary

## Purpose

This lab demonstrates how MongoDB can support simple yet realistic medical operations. We focus on extracting insights from concrete clinical collections, keeping each script short, well-documented, and executable directly with `mongosh` so reviewers can reproduce the steps without overengineering.

## Collections

- **patients:** stores demographics, contact information, and chronic-history arrays. Queries filter by age, gender, or chronic conditions and project only fields needed for decision-making.
- **visits:** records encounter metadata (department, provider, vital signs, procedures, prescriptions, follow-up). Scripts read recent visits, flag hypertension, and trace specific medications.
- **lab_results:** contains test identifiers, patient references, codes, outcomes, and abnormal flags. We upsert new results and pull the latest entries per patient.

Each collection reflects a realistic slice of a healthcare workflow and is accessed directly by the scripts under `project/queries`.

## Query coverage

There are eleven curated query scripts (plus one supporting index builder) covering CRUD, aggregation, and performance scenarios:

- **CRUD:** insert a new patient, update contact details, delete inactive patients, and upsert lab results with guarded filters so each mutation touches only the intended documents.
- **Aggregations:** two pipelines (patients and visits) answer screening and departmental-reporting questions while leaning on indexed fields to avoid full scans.
- **Read helpers:** queries expose recent visits, prescriptions for `Lisinopril`, and the last three lab results per patient, all projecting a compact field set suitable for dashboards.
- **Indexes:** a dedicated script creates the `department + visit_date` compound index and the `medical_history.chronic_conditions` index that speed the workloads above.

## Design choices

We prioritized clarity and realism. Each script is documented inline, uses explicit filter criteria, and avoids nested helpers to keep the logic transparent. The dataset lives inside `project/data/`, so running any of the mongosh scripts touches the actual JSON collections without additional tooling. This keeps the project lightweight while satisfying the lab’s requirements for CRUD, aggregations, and index usage.
