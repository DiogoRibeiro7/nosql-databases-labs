# Lab 01 – Advanced Exercises & Challenges

These exercises are optional but recommended once you are comfortable with the core Lab 01 tasks. They emphasize automation, data validation, and small application prototypes so you can move beyond manual CLI experimentation.

---

## Advanced Exercise 1: Environment Diagnostics Script

**Goal:** provide a repeatable “doctor” script that students or teammates can run before starting the lab.

### Tasks
1. Write a script (Node.js, Python, or shell) named `env_check.*` that:
   - Verifies `mongod`, `mongosh`, and `mongoimport` are in `$PATH` (or `Get-Command` on PowerShell).
   - Checks whether the default MongoDB port (27017) is reachable.
   - Ensures the dataset files in `starter/data/` exist and reports their sizes.
2. Make the script exit with a non-zero status when a requirement is missing.
3. Print actionable remediation hints (e.g., “Install MongoDB via …” or “Run setup_database.sh first”).
4. Document how to run the script in `NOTES.md` under an “Advanced Exercises” heading.

**Deliverable:** `labs/lab01_intro/env_check.{js|py|ps1|sh}` plus instructions in `NOTES.md`.

---

## Advanced Exercise 2: Automated Data Seeder with Idempotency

**Goal:** move beyond one-off `mongoimport` commands by creating a scripted workflow that wipes + seeds your database safely.

### Tasks
1. Create `labs/lab01_intro/seed_database.js` that:
   - Drops (or renames) the target database if it already exists.
   - Imports `starter/data/sample.json`.
   - Inserts at least five synthetic documents generated at runtime (random dates/balances).
   - Prints a short summary (`totalDocs`, earliest/latest `createdAt`, city distribution).
2. Re-run the script multiple times to prove it remains idempotent (no duplicates/dangling collections).
3. Capture console output samples in `NOTES.md`.

**Deliverable:** `seed_database.js` script + description of how idempotency is achieved.

---

## Advanced Exercise 3: Minimal API Smoke Test

**Goal:** interact with your Lab 01 dataset through code, simulating the first step toward an application.

### Tasks
1. Use your preferred runtime (Node/Express, Python/FastAPI, etc.) to build a tiny API with endpoints:
   - `GET /health` – confirms MongoDB connectivity and returns database/collection counts.
   - `GET /customers?city=<name>` – returns up to 10 matching customers.
   - `POST /customers` – inserts a new customer (validate required fields server-side).
2. Store the server in `labs/lab01_intro/server/`.
3. Add a short load script (`scripts/smoke_test.sh` or `.ps1`) that exercises those endpoints using `curl`.
4. Note security assumptions (e.g., “local only”) and improvement ideas in `NOTES.md`.

**Deliverables:** server source files, smoke-test script, and documentation of decisions.

---

## Tracking & Submission

Create a section called **“Advanced Exercises Status”** in `labs/lab01_intro/NOTES.md` summarizing which exercises you attempted, commands to run them, and any metrics you gathered (execution time, doc counts, etc.). Partial completion is acceptable as long as you document current blockers.
