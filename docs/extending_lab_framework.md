# Extending the Lab Framework

This guide explains how to add a new lab (or enhance an existing one) so it stays consistent with the repository conventions. Use it when drafting Lab 06+, extra tracks, or tailored company exercises.

---

## 1. Plan the Lab

1. **Scope & objectives** – Write 3‑5 bullet learning goals plus prerequisites.
2. **Dataset strategy** – Decide whether to reuse an existing dataset (`data/`), generate a synthetic one, or bundle new fixtures under `labs/<lab_id>/starter/data/`.
3. **Runtime assumptions** – Specify MongoDB version, optional dependencies (Node.js, Docker), and expected hardware.

Capture these decisions in a short proposal (e.g., `docs/lab06_proposal.md`) if you need instructor review before implementation.

---

## 2. Create the Directory Skeleton

```
labs/
  lab06_example/
    README.md
    NOTES.md
    FILE_USAGE_GUIDE.md
    starter/
      data/
      scripts/ (optional)
    tests/
```

Minimum files:

- `README.md` – main instructions (mirroring Lab 01–05 structure: objectives, setup, tasks, submission, self-assessment, warm-up, advanced challenges).
- `NOTES.md` – template for students to document findings.
- `FILE_USAGE_GUIDE.md` – declare which scripts run under Node.js vs `mongosh`.

Optional but recommended:

- `BASIC_EXERCISES.md` and `ADVANCED_EXERCISES.md`.
- Setup helpers (`setup_database.sh/.bat`, `import_data.js`).
- Test runners (`test_lab06_*.js`).

Use existing labs as references for tone and formatting.

---

## 3. Author the README

Each lab README should include:

1. **Objectives & prerequisites**
2. **Dataset & import instructions**
3. **Tasks** – Broken into numbered sections with deliverables.
4. **What to submit** – File checklist plus reference to `instructions/submission_guide.md`.
5. **Self-assessment checklist** – Replace grading language with practice-oriented prompts.
6. **Warm-up & advanced challenge links** – Point to the optional exercise files if provided.
7. **Tips & best practices** – Optional but encouraged for labs that rely on specific tools (e.g., `explain()`, `$setWindowFields`, replica commands).

When referencing shared docs:

- Performance goals → link to `docs/performance_expectations.md`.
- Troubleshooting → link to `TROUBLESHOOTING.md`.
- Docker instructions → link to `DOCKER_SETUP.md` or `docker-compose.yml`.

---

## 4. Provide Starter Assets

### Data

- Keep raw JSON/CSV/NDJSON files under `starter/data/`.
- Include a short README or `schema.md` describing key fields.
- If datasets are large (>50 MB), consider referencing `data/` or Git LFS instead of duplicating files.

### Scripts

- Import scripts: `import_data.js` (Node) and/or `import_data_mongosh.js`.
- Setup scripts: `setup_database.sh/.bat` for Docker/standalone.
- Query or aggregation templates: `queries.js`, `aggregations.js`, etc.

Include comments indicating runtime (Node vs mongosh) and how to configure connection strings (use environment variables when possible).

---

## 5. Add Tests (Optional but Encouraged)

Testing patterns:

| Lab type            | Example tests                                                        |
| ------------------- | -------------------------------------------------------------------- |
| CRUD / queries      | `test_queries.js`, `test_data_integrity.js`                          |
| Aggregation         | `test_labXX_performance.js` capturing execution stats                |
| Replication / infra | Node scripts that hit health endpoints or run MongoDB admin commands |

Guidelines:

- Co-locate tests in the lab directory or under `tests/` with a clear filename (`test_lab06_mongosh.js`).
- Use `assert`/`expect` statements instead of printing results.
- Include instructions in the lab README about how/when to run them (`node test_lab06_mongosh.js`).

---

## 6. Document Performance Expectations

Update `docs/performance_expectations.md` with:

- Dataset sizes
- Expected query or pipeline latency
- Setup timing (e.g., replica spin-up)

Reference the entry from your lab README so students know where the targets live.

---

## 7. Update Repository Metadata

1. **README** – Mention the new lab in the “Working on Labs” section.
2. **IMPROVEMENTS.md** – If the lab fulfills a roadmap item, mark it `[x]`.
3. **syllabus.md** – Add the lab to the schedule if applicable.
4. **instructions/submission_guide.md** – Note any new file types or screenshots you expect.

---

## 8. Review Checklist

- [ ] README follows the standard structure.
- [ ] `BASIC_EXERCISES.md` / `ADVANCED_EXERCISES.md` added (if applicable).
- [ ] Starter data & scripts are documented in `FILE_USAGE_GUIDE.md`.
- [ ] Tests (if any) run locally in < 1 minute.
- [ ] Notes template includes sections for assumptions, troubleshooting, and performance metrics.
- [ ] Performance expectations documented in `docs/performance_expectations.md`.
- [ ] Repository-level docs updated.

Once the checklist passes, open a PR referencing this guide so reviewers can verify alignment.
