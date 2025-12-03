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

## 2. Technologies & Tools

This course primarily focuses on:

* **MongoDB** – Document database for all labs
* **MongoDB Shell (mongosh)** – Interactive MongoDB shell
* **MongoDB Database Tools** – Including `mongoimport` and `mongorestore`
* **Node.js** (optional) – For programmatic database access
* **Sample Datasets** – 30+ real-world datasets included in the repository

Prerequisites:
* MongoDB Community Edition (latest stable version)
* MongoDB Database Tools
* Text editor or IDE of your choice

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

Key repository components:

* **`instructions.md`** – Comprehensive guide for importing data into MongoDB
* **`data/`** – Extensive collection of sample datasets in JSON and BSON formats
* **`labs/`** – Practical exercises with step-by-step instructions
* Each lab includes setup scripts, query examples, and test files

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

1. **Quick Start**: See the [**MongoDB Data Import Instructions**](./instructions.md) for detailed guidance
2. **Example**: Import a dataset using mongoimport:
   ```bash
   mongoimport --db training --collection books --file data/datasets/books.json --jsonArray
   ```

### 4.3. Working on Labs

Currently available:

* **Lab 01 – Introduction & Setup**
  * Location: `labs/lab01_intro/`
  * Features: MongoDB setup, basic CRUD operations, indexing
  * Includes: `import_data.js`, `queries.js`, `test_queries.js`
  * Setup guide: `SETUP_MONGOSH.md` for MongoDB Shell installation

To start Lab 01:
```bash
cd labs/lab01_intro
mongosh --file import_data.js  # Load sample data
mongosh --file queries.js      # Run example queries
```

---

## 5. Available Datasets

The repository includes 30+ sample datasets for practice:

### Core Datasets (`data/datasets/`)
* **books.json** – Book catalog with titles, authors, and categories
* **companies.json** – Company information and financial data
* **products.json** – Product inventory and pricing
* **restaurant.json** – Restaurant listings and ratings
* **students.json** – Student records and grades
* **countries-big.json** & **countries-small.json** – Geographic data

### MongoDB Sample Datasets
* **sample_airbnb/** – Vacation rental listings and reviews
* **sample_analytics/** – Financial accounts and transactions
* **sample_geospatial/** – Shipwreck locations with coordinates
* **sample_mflix/** – Movie database with reviews and theaters
* **sample_supplies/** – Sales and inventory data
* **sample_training/** – Various datasets for learning (tweets, trips, zips, etc.)
* **sample_weatherdata/** – Weather observations

### BSON Format Examples
* **ColoradoScooters/** – Scooter rental data in BSON format

> **📚 Import Guide:** See [**MongoDB Data Import Instructions**](./instructions.md) for detailed steps on loading these datasets

---


## 6. Getting help

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

## 7. License

Unless specified otherwise, this repository is provided under the **MIT License** (or another license chosen by the instructor).

See [`LICENSE`](LICENSE) for details.

---

## Instructor

**Diogo Ribeiro**
GitHub: [@diogoribeiro7](https://github.com/diogoribeiro7)
