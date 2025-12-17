# Testing Framework Guide

This document explains how to run automated tests for the five core labs. Each lab ships with import scripts, validation suites, and optional benchmarks. Use these commands before submitting your work or opening a pull request.

---

## Prerequisites

- MongoDB 6.0+ running locally (`mongosh --eval "db.version()"`)
- Node.js 18+ (`node -v`)
- Repository dependencies installed (`npm install`)

---

## Quick Start: Run All Lab Tests

Use the helper script to set up data and execute the available test suites:

```bash
npm run test:labs
```

> Tip: ensure MongoDB is running locally (or set `MONGODB_URI`) before executing the command. The script will exit early with instructions if it cannot connect.

This command sequentially:

1. Imports sample datasets for Labs 01–04
2. Runs the assertion-based test suites for each lab
3. Prints a summary with pass/fail counts
4. Skips replication tests automatically if a local replica set is not running

You can run an individual lab by passing `--lab=lab03`:

```bash
node scripts/run_lab_tests.js --lab=lab03
```

Valid lab identifiers: `lab01`, `lab02`, `lab03`, `lab04`, `lab05`.

---

## Lab-by-Lab Commands

### Lab 01 – Introduction

```bash
cd labs/lab01_intro
node import_data.js              # optional convenience import
node test_lab01.js
```

### Lab 02 – Data Modeling

```bash
cd labs/lab02_modeling
node import_data.js
node run_all_tests.js            # runs integrity + performance suites
```

### Lab 03 – Advanced Queries

```bash
cd labs/lab03_queries
node import_data.js
node test_data_integrity.js      # assertion-based validation
# Optional:
# node test_lab03_performance.js
# mongosh lab03_movies --file test_lab03_mongosh.js
```

### Lab 04 – Aggregation Pipeline

```bash
cd labs/lab04_aggregation
node import_data.js
node test_lab04.js
```

### Lab 05 – Replication

Replication tests require a local replica set (ports 27017–27019). After running `node setup_replica_set.js`:

```bash
cd labs/lab05_replication
node test_replication.js
```

If you only have a standalone MongoDB instance, the lab tests are skipped automatically with a warning.

---

## Writing New Tests

- Reuse `tests/test_framework.js` (mongosh) or `labs/test_framework.js` (Node) for consistent assertions.
- Store lab-specific scripts inside the corresponding `labs/<lab_id>/` directory.
- Print clear success/failure messages; CI logs rely on these strings.
- If your test requires sample data, expose a Node script (`import_data.js`) so CI and `run_lab_tests.js` can set everything up.

---

## CI/CD Integration

Multiple GitHub Actions workflows keep the repository healthy:

- `.github/workflows/ci.yml`: full pipeline with Python quality gates, MongoDB lab tests, benchmarks, and submission validators.
- `.github/workflows/quick-node-quality.yml`: fast feedback on linting, formatting, and dataset smoke tests for JavaScript-heavy changes.
- `.github/workflows/dataset-consistency.yml`: scheduled/nightly dataset validation plus automatic runs whenever files under `data/` change.

Review these workflow files if you need to add additional suites.

---

Need help? Open a [GitHub Discussion](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) or file a [testing issue](https://github.com/diogoribeiro7/nosql-databases-labs/issues) with the `testing` label.
