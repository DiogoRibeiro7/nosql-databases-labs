# Lab 01 – Practice Exercises

New hands-on challenges that go beyond the Lab 01 starter tasks. Use the `lab01_student` database but create separate collections so you don’t overwrite required lab deliverables.

---

## Exercise A · Customer Segmentation Dashboard
1. Duplicate the base `customers` data into `customers_marketing`.
2. Add fields for `segment` (e.g., `student`, `professional`, `enterprise`) and `engagementScore`.
3. Build a script (`segment_dashboard.js`) that:
   - Groups by `segment`.
   - Calculates average balance, average age, and count of users per segment.
   - Outputs a JSON summary file (`segments_report.json`).
4. Stretch goal: add a `$bucket` stage to show age distribution per segment.

## Exercise B · Event Log Importer
1. Create a new collection `event_log`.
2. Write a mongosh script that loads NDJSON lines (you can generate mock data or reuse `sample.json`) and enrich each row with:
   - `ingestedAt`
   - `sourceFile`
   - Upper-cased city names.
3. Ensure an index on `{ eventType: 1, eventDate: -1 }`.
4. Verify via `db.event_log.validate()` and document the import count in `NOTES.md`.

## Exercise C · CLI Reset Utility
1. Write a Node script `reset_lab01_collections.js` that:
   - Drops `customers`, `customers_marketing`, and `event_log`.
   - Re-runs the official `import_data.js`.
2. Add CLI flags:
   - `--keep-marketing` (skip dropping `customers_marketing`).
   - `--seed-extra` (inserts three extra mock customers).
3. Log before/after counts for each collection.

> Record results for each exercise in `labs/lab01_intro/NOTES.md` under a “Practice Exercises” heading. Include commands used and any runtime observations.
