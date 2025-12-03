# NoSQL Databases – Practical Labs (`nosql-databases-labs`)

This repository contains the **practical work** for the *NoSQL Databases* course.
Students will use this repo to work on weekly labs and (optionally) a final project.

> **Repository name:** `nosql-databases-labs`
>
> **Audience:** Students enrolled in the NoSQL Databases class.
>
> **Main focus:** Hands-on experience with NoSQL data modeling, querying, consistency, and performance.

---

## 1. Learning goals

By completing these labs, you should be able to:

* Understand the key differences between relational and NoSQL databases.
* Design schemas for document, key–value, column-family, and/or graph databases.
* Implement typical operations: CRUD, indexing, aggregation, and simple analytics.
* Reason about consistency, replication, and sharding in NoSQL systems.
* Evaluate trade-offs between modeling choices and query performance.

The exact topics and depth may vary by edition of the course; see `syllabus.md` if provided.

---

## 2. Technologies

Depending on the semester, we may use one or more of the following (the exact list will be provided in class or on the course platform):

* **Document store** – e.g. MongoDB
* **Key–value / wide-column** – e.g. Redis, Cassandra, DynamoDB
* **Graph database** – e.g. Neo4j
* **Containerization (optional)** – Docker / Docker Compose for local setup

Each lab README will state explicitly which tools are required.

---

## 3. Repository structure

A typical structure for this repository is:

```text
nosql-databases-labs/
├── README.md                 # You are here
├── instructions.md           # MongoDB data import guide
├── syllabus.md               # (Optional) Course outline and schedule
├── data/                     # Sample datasets (JSON/BSON files)
│   ├── datasets/             # General purpose datasets
│   ├── sample_*/             # MongoDB sample datasets
│   └── ColoradoScooters/     # BSON format examples
├── instructions/
│   └── project_guidelines.md # Final project specification
└── labs/
    ├── lab01_intro/
    │   ├── README.md         # Lab specification
    │   └── starter/          # Optional starter code / data
    ├── lab02_modeling/
    │   ├── README.md
    │   └── starter/
    ├── lab03_queries/
    │   ├── README.md
    │   └── starter/
    └── ...
```

Each lab folder contains at least:

* A **`README.md`** with the lab statement, requirements, and examples.
* Optionally a **`starter/`** directory with starter code, schemas, or datasets.

You should **not** modify the global structure of the repository unless explicitly instructed.

---

## 4. How to use this repository (students)

### 4.1. Getting the code

You should either:

1. **Fork** the repository on GitHub (recommended), or
2. **Clone** it directly if instructed (for example, when using GitHub Classroom templates).

Example:

```bash
# Clone the main repository
git clone https://github.com/diogoribeiro7/nosql-databases-labs.git
cd nosql-databases-labs
```

If you are using a **fork**:

```bash
git clone https://github.com/<your-username>/nosql-databases-labs.git
cd nosql-databases-labs
```

---

### 4.2. Working on a lab

For each lab:

1. Go to the corresponding folder, e.g.:

   ```bash
   cd labs/lab01_intro
   ```

2. Read the **`README.md`** with the instructions.

3. Work inside the suggested folders (e.g. `starter/` or `src/`, if created).

4. Follow the naming conventions specified in `instructions/submission_guide.md`.

You may create additional files and directories inside each lab folder, as long as you respect the submission rules.

---

### 4.3. Submitting your work

Submission rules may depend on the platform used.
Unless stated otherwise, the standard workflow is:

1. **Commit** your changes with a clear message:

   ```bash
   git add .
   git commit -m "LAB01 – Completed basic queries"
   ```

2. **Push** your work to your fork or to the provided remote:

   ```bash
   git push origin main
   ```

3. **Submit** according to [`instructions/submission_guide.md`](instructions/submission_guide.md), for example:

   * Submit the URL of your repository.
   * Submit the URL of a specific branch or tag.
   * Upload a `.zip` export if required by the platform.

Always verify the deadline and any late-submission policy.

---

## 5. Lab overview

> The detailed description for each lab is in `labs/<lab_name>/README.md`.

The exact list of labs may change, but a typical set includes:

* **Lab 01 – Introduction & Setup**

  * Install NoSQL tools (e.g. MongoDB / Docker image).
  * Basic CRUD operations.
  * Importing and exporting JSON data.

  > **📚 Data Import Guide:** For detailed instructions on how to import JSON and BSON files from the `data/` folder into MongoDB, see the [**MongoDB Data Import Instructions**](./instructions.md). This guide covers multiple import methods including `mongoimport`, `mongorestore`, MongoDB Shell, and programmatic approaches.

* **Lab 02 – Data Modeling**

  * Design a schema for a simple application.
  * Embed vs reference.
  * Denormalization strategies and query patterns.

* **Lab 03 – Queries and Indexes**

  * Filtering and projections.
  * Aggregation pipelines / query operators.
  * Creating and analyzing indexes.

* **Lab 04 – Advanced Aggregation & Analytics**

  * Complex aggregation pipelines.
  * Time-series analysis and window functions.
  * Multi-collection joins with $lookup.
  * Business analytics and reporting.

* **Final Project** (if assigned)

  * Design and implement a small application backed by at least one NoSQL database.
  * Explain your modeling decisions and trade-offs in a short written report.

The concrete list and grading weights are defined in `syllabus.md` and `instructions/grading_rubric.md`.

---

## 6. Evaluation

The evaluation criteria for labs are detailed in
[`instructions/grading_rubric.md`](instructions/grading_rubric.md). In general:

* Each lab has a defined **weight** in the final grade.
* Late submissions may incur **penalties** (or may not be accepted).

Your work for each lab will usually be graded on:

1. **Correctness**

   * Does your solution meet the requirements?
   * Do your queries/operations return the expected results?

2. **Code and data organization**

   * Clear structure of files and folders.
   * Meaningful names for scripts, collections, and databases.
   * Basic comments or notes where appropriate.

3. **Reproducibility**

   * Can the instructor reproduce your results easily?
   * Are there clear instructions (e.g. in `NOTES.md`) on how to run your scripts?

4. **Professionalism**

   * Clean commit history (no large temporary files, no secrets).
   * Respecting naming and submission conventions.

---

## 7. Academic integrity

You are encouraged to:

* Discuss ideas and concepts with your classmates.
* Ask questions and request clarification during labs or on the course forum.

However, you must **not**:

* Copy code or full solutions from other students.
* Publish your solutions in public repositories during the course.
* Use AI tools to produce complete solutions without understanding them.

If you use external resources (documentation, tutorials, snippets), you must **cite them**, e.g.:

* As a comment in your scripts.
* In a small `REFERENCES.md` file inside the lab folder.

Violations of academic integrity may lead to penalties according to the institution's regulations.

---

## 8. Getting help

If you have questions about a lab, please:

1. Read the lab `README.md` carefully.
2. Check any FAQs or announcements on the course platform.
3. Ask during lab sessions or office hours.
4. Use the official communication channels (forum, email, etc.).

When asking for help, always include:

* The **lab number** and, if relevant, the **exercise number**.
* A short description of what you tried.
* Any relevant error messages or unexpected results.

This helps the teaching staff answer you faster and more effectively.

---

## 9. License

Unless specified otherwise, this repository is provided under the **MIT License** (or another license chosen by the instructor).

See [`LICENSE`](LICENSE) for details.

---

## Instructor

**Diogo Ribeiro**
GitHub: [@diogoribeiro7](https://github.com/diogoribeiro7)
