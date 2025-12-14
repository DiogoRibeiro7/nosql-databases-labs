# NoSQL Databases - Practical Labs (`nosql-databases-labs`)

Hands-on home for the NoSQL Databases course. Clone the repo, run the mongosh-first lab scripts, and document your findings inside each lab folder. Every lab ships with import scripts, tests, and optional practice exercises. Use this README as your quick reference while lab READMEs dive into specifics.

> **Quick Navigation**
> - Essential tooling & setup checklist
> - Lab overview (Labs 01-05 + Modern Features + Practice Sets)
> - Data catalog (`data/`)
> - Testing, submissions, and collaboration workflow
> - Remember: use the [Issues](https://github.com/diogoribeiro7/nosql-databases-labs/issues) tab for bugs/requests and the [Discussions](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) tab to ask questions or share solutions with the instructor/TAs. Always review [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before posting.

---

## 1. Learning goals

By completing these labs, you should be able to:

* Understand the key differences between relational and NoSQL databases.
* Design schemas for document, key-value, column-family, and/or graph databases.
* Implement typical operations: CRUD, indexing, aggregation, and simple analytics.
* Reason about consistency, replication, and sharding in NoSQL systems.
* Evaluate trade-offs between modeling choices and query performance.

The exact topics and depth may vary by edition of the course; see `syllabus.md` if provided.

---

## 2. Tooling & Setup Checklist

| Tool | Purpose |
| --- | --- |
| MongoDB Community Edition 6.x | Run local single instances + replica sets |
| mongosh | Primary interface (all `solutions.js` scripts are mongosh-based) |
| MongoDB Database Tools | `mongoimport`, `mongorestore`, `mongodump`, etc. |
| Node.js 18+ (optional) | Some helper scripts/tests use Node |
| Git + Editor | Manage submissions, edit scripts, take notes |

### First-Time Setup
```bash
git clone https://github.com/diogoribeiro7/nosql-databases-labs.git
cd nosql-databases-labs
npm install        # optional, needed for lint/tests
```

* Copy `.env.example` files where applicable (e.g., `labs/lab_modern_features/.env.example` -> `.env`).
* Start MongoDB locally or `docker compose up` if you prefer containers.
* Import starter data via `mongosh labs/<lab>/import_data*.js`.
* Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before making contributions or opening PRs.

---

## 3. Repository Structure (What Matters Where)

```
nosql-databases-labs/
|-- README.md
|-- instructions/
|   |-- project_guidelines.md
|   |-- submission_guide.md
|-- data/
|-- docs/
|-- exercises/
|-- labs/
|   |-- lab01_intro/
|   |-- lab02_modeling/
|   |-- lab03_queries/
|   |-- lab04_aggregation/
|   |-- lab05_replication/
|   |-- lab_modern_features/
|-- scripts/
```

Each lab folder contains:
1. `README.md`, `NOTES.md`, and exercise markdowns.
2. Mongosh-first scripts (`import_data*.js`, `queries_mongosh.js`, `solutions.js`).
3. Automated tests (Node or mongosh) invoked by GitHub Actions + `npm run test:labs`.

---

## 4. Getting Started

### 4.1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/diogoribeiro7/nosql-databases-labs.git
cd nosql-databases-labs
```

### 4.2. Import Sample Data

Before starting the labs, import the sample datasets into MongoDB:

1. **Quick Start**: See the [MongoDB Data Import Instructions](./instructions.md) for detailed guidance.
2. **Example**: Import a dataset using mongoimport:
   ```bash
   mongoimport --db training --collection books --file data/datasets/books.json --jsonArray
   ```

### 4.3. Working on Labs

| Lab | Folder | Core Topics | Quick Start |
| --- | --- | --- | --- |
| Lab 01 - Intro & Setup | `labs/lab01_intro/` | CRUD, indexing, mongosh basics | `mongosh labs/lab01_intro/solutions.js` |
| Lab 02 - Data Modeling | `labs/lab02_modeling/` | Embedding vs referencing, validation, perf | `mongosh labs/lab02_modeling/import_data_mongosh.js` |
| Lab 03 - Queries & Indexes | `labs/lab03_queries/` | Aggregations, explain plans, perf harness | `mongosh labs/lab03_queries/solutions.js` |
| Lab 04 - Aggregation | `labs/lab04_aggregation/` | Multi-stage analytics, window functions | `mongosh labs/lab04_aggregation/solutions.js` |
| Lab 05 - Replication | `labs/lab05_replication/` | Replica set setup, failover drills | `mongosh labs/lab05_replication/replica_set_setup.js` |
| Modern Features Lab | `labs/lab_modern_features/` | Change streams, time-series, Atlas/Vector Search, GridFS, Charts | `cd labs/lab_modern_features && npm install && node setup/initialize_data.js && mongosh exercises/01_change_streams/solution.js` |

Each lab also has optional practice exercises documented in `exercises/` with corresponding solutions in `exercises/solutions/` for self-paced students.

### 4.4. Performance Expectations

Each lab includes target data sizes, latency goals, and timing budgets so you can verify your environment before tackling the deeper exercises. Review [`docs/performance_expectations.md`](docs/performance_expectations.md) for the per-lab checklist and link it from your lab notes when reporting metrics.

### 4.5. Testing & Validation

Automated test suites exist for Labs 01-05. Run them locally with:

```bash
npm run test:labs
```

See [`docs/testing_framework.md`](docs/testing_framework.md) for per-lab commands, advanced benchmarks, and CI integration details.

### 4.6. Extending the Lab Framework

Instructors or contributors who want to add new labs should follow [`docs/extending_lab_framework.md`](docs/extending_lab_framework.md). It covers directory structure, README expectations, starter data/scripts, and how to update repository metadata when introducing additional content.

### 4.7. Self-Paced Learning Paths

Not sure what to tackle next? Follow the recommended sequences in [`docs/self_paced_paths.md`](docs/self_paced_paths.md). It outlines the core labs, advanced tracks, modern features lab, and optional projects.

### 4.8. Feedback & Collaboration

- **Issues:** Report bugs/missing instructions or propose enhancements via the [Issues tab](https://github.com/diogoribeiro7/nosql-databases-labs/issues). Tag the relevant lab (`lab03`, `docs`, `data`, etc.) so maintainers triage quickly.
- **Discussions:** Ask conceptual questions, share your solutions, or suggest improvements in the [Discussions tab](https://github.com/diogoribeiro7/nosql-databases-labs/discussions). The instructor and TAs monitor these threads and often highlight best practices. Always search existing threads before opening a new one.
- **Code of Conduct:** All interactions must follow [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

---

## 5. Available Datasets

See `data/README.md` for an overview of the 30+ JSON/NDJSON/BSON datasets bundled with the repo, including sample_airbnb, sample_mflix, sample_supplies, and more.

---

## 7. Tooling & Quality Checks

```bash
npm install
npm run lint
npm run test:data
npm run test:labs
```

`npm test` runs lint + data smoke tests. CI mirrors these steps, then spins up MongoDB to execute lab scripts. If you add/remove data files, update `scripts/data-manifest.json` so the smoke tests remain accurate.

---

## 8. Contributing & Pull Requests

* Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for workflow, tooling, and submission standards.
* Review the detailed [Pull Request Guide](./pull_requests.md) and use the template stored in `.github/PULL_REQUEST_TEMPLATE.md`.
* Follow the [Code of Conduct](./CODE_OF_CONDUCT.md) in every interaction.
* Group deliverables must follow the structure defined in [`group-work/README.md`](./group-work/README.md).
* When filing issues, select the appropriate template under `.github/ISSUE_TEMPLATE/`.

---

## 9. License

This repository is provided under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## Instructor & Support

**Diogo Ribeiro**  
GitHub: [@diogoribeiro7](https://github.com/diogoribeiro7)

Need help?
- Open a [Discussion](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) for conceptual questions or lab clarifications.
- File an [Issue](https://github.com/diogoribeiro7/nosql-databases-labs/issues) if you find bugs or have feature requests.
- Mention lab number + reproduction steps when asking for assistance.
