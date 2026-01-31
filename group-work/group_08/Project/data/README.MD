# Data Folder

These JSON files mirror the documents embedded inside `import_data.mongosh.js`. They remain in the repository so students can inspect or copy/paste them when preparing slides, but running the project no longer depends on reading from disk.

| File | Description |
| ---- | ----------- |
| `grades.json` | Canonical catalog of partner food vendors and their operational capacity. |
| `students.json` | Events sponsored by the municipality with embedded venue information. |
| `subjects.json` | Sanitized orders captured during the events; doubles as telemetry for service-level reports. |
| `students.json` | List of student records, including identifiers and basic profile information. |
| `subjects.json` | Catalog of school subjects/courses available in the curriculum. |
| `grades.json` | Grade records linking students to subjects and their scores or marks. |

Usage tips:

1. Run `mongosh import_data.mongosh.js` and the script will insert the inline arrays into MongoDB.
2. If you expand the dataset, update both the JSON reference files and the inline arrays so they stay in sync.
3. For larger datasets, describe the download/generation process here so reviewers can reproduce it if needed.