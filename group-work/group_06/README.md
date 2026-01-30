# Group 06 - MongoDB NoSQL Database Project

## Team Members

See our team composition in [group_members.md](../group_members.md#group-06)

## Project Overview

This project demonstrates our comprehensive understanding of MongoDB database operations and NoSQL concepts. We have implemented a complete set of database solutions that showcase our ability to design schemas, insert data, and create complex queries for real-world scenarios.

### Learning Objectives Achieved

- Mastered MongoDB query language and operators
- Designed efficient document schemas following best practices
- Implemented complex aggregation pipelines for data analysis
- Created optimized indexes for query performance
- Developed data insertion strategies for various use cases

## Database Design

### Collections Created

1. **Primary Collections**
   - Structured document schemas with embedded documents
   - Referenced relationships between collections
   - Optimized field types and data structures

2. **Schema Design Decisions**
   - Denormalization strategies for read optimization
   - Embedding vs referencing trade-offs
   - Index planning based on query patterns

## Data Operations Implemented

### 1. Database Creation & Setup

- Created database with appropriate naming conventions
- Established collections with validation rules
- Set up indexes for optimal query performance

### 2. Data Insertion

- **Bulk Insert Operations**: Efficient insertion of large datasets
- **Single Document Inserts**: Individual record creation with validation
- **Batch Processing**: Organized data imports from multiple sources
- **Data Generation**: Created realistic test data using various patterns

### 3. Query Operations

#### Basic Queries

- Find operations with multiple filter conditions
- Projection to retrieve specific fields
- Sorting and limiting result sets
- Regular expression searches for text patterns

#### Advanced Queries

- Complex filtering with `$and`, `$or`, `$nor` operators
- Array queries using `$elemMatch`, `$all`, `$size`
- Nested document queries with dot notation
- Comparison operators for range queries

### 4. Aggregation Pipelines

#### Data Analysis Pipelines

- `$match` stages for filtering
- `$group` operations for statistical analysis
- `$project` for data transformation
- `$sort` and `$limit` for result control

#### Complex Aggregations

- Multi-stage pipelines for business analytics
- `$lookup` for joining collections
- `$unwind` for array manipulation
- `$facet` for multiple aggregation outputs

### 5. Update Operations

- Single and multi-document updates
- Array update operators (`$push`, `$pull`, `$addToSet`)
- Field update operators (`$set`, `$unset`, `$inc`)
- Conditional updates with query filters

### 6. Index Management

- Single field indexes for common queries
- Compound indexes for complex query patterns
- Text indexes for search functionality
- Unique indexes for data integrity

## Technologies & Tools Used

- **Database**: MongoDB 7.0
- **Shell**: MongoDB Shell (mongosh)
- **Query Language**: MongoDB Query Language (MQL)
- **Tools**: MongoDB Compass for visualization
- **Scripts**: JavaScript for database operations

## Database Setup Instructions

### Prerequisites

- MongoDB 7.0 or higher installed locally
- MongoDB Shell (mongosh) installed
- MongoDB Compass (optional, for GUI access)

### Running Our Solution

1. **Start MongoDB Server**

   ```bash
   mongod --dbpath /path/to/data/directory
   ```

2. **Connect to MongoDB**

   ```bash
   mongosh
   ```

3. **Create and Use Database**

   ```javascript
   use group_06_db
   ```

4. **Execute Our Scripts**

   ```bash
   mongosh < solution.js
   ```

5. **Verify Data**
   ```javascript
   db.getCollectionNames();
   db.collection_name.countDocuments();
   ```

## Data import

Before running the query scripts, load the sample data into `medical_database`. An import script is provided:

- **Script**: `project/import_data.sh` — imports `project/data/patients.json`, `project/data/visits.json`, and `project/data/lab_results.json` into the `medical_database` database.
- **Requirements**: MongoDB running locally and `mongoimport` (included with MongoDB tools).
- **Usage** (from repository root):
  ```bash
  chmod +x group-work/group_06/project/import_data.sh
  ./group-work/group_06/project/import_data.sh
  ```
- **Custom URI**: set `MONGODB_URI` if needed, e.g. `MONGODB_URI="mongodb://localhost:27017" ./group-work/group_06/project/import_data.sh`.

If the collections are missing, the query scripts will throw an error and point you to run this import first.

## Query Scripts

All query logic lives under `group-work/group_06/project/queries` and targets the `medical_database` collections. The folder holds 12 scripts, each documented inline and focusing on realistic MongoDB interactions. **Validação** (base e collections `patients`, `visits`, `lab_results`) está no ficheiro `ensure_medical_db.mongosh.js`; cada script carrega-o com `load(...)`. Se faltar alguma collection, aparece um erro a pedir para correr o import (ver Data import). **Corre os scripts a partir da raiz do repositório**, e.g. `mongosh group-work/group_06/project/queries/01_patients_by_age_and_gender.mongosh.js`.

- `01_patients_by_age_and_gender.mongosh.js` – aggregation that filters Lisbon women aged 18‑65 and sorts them by descending age.
- `02_chronic_patients_by_condition.mongosh.js` – find operation projecting only identifiers for patients with Diabetes or Hypertension.
- `03_insert_new_patient.mongosh.js` – simple insert to register a new triage patient.
- `04_update_patient_contact.mongosh.js` – update that keeps patient communication data current.
- `05_delete_inactive_patient.mongosh.js` – delete flow targeting inactive records to keep storage lean.
- `06_recent_visits_for_patient.mongosh.js` – read helper showing the five most recent visits per patient (configurable `PATIENT_ID` at top of file).
- `07_visits_by_department_with_index.mongosh.js` – aggregation that counts visits per department using the `department` index, with `explain("executionStats")` to prove index usage.
- `08_update_and_insert_lab_result.mongosh.js` – upsert for lab results so the latest record replaces or inserts as needed.
- `09_list_prescription_medications.mongosh.js` – projection for visits where `Lisinopril` was prescribed, ideal for pharmacovigilance reporting.
- `10_visit_indexes.mongosh.js` – index creation script that builds the compound `department + visit_date` index and the chronic-conditions index used across the queries.
- `11_last_lab_results_for_patient.mongosh.js` – last three lab results for a patient (configurable `PATIENT_ID` at top of file).
- `12_flag_high_bp_visits.mongosh.js` – flags visits with high blood pressure for follow-up.

Each file can be executed via `mongosh` to inspect its output or confirm its effect.

### Script idempotency and safe re-runs

- **Read-only scripts** (01, 02, 06, 07, 09, 10, 11): safe to run repeatedly; they do not modify data.
- **03_insert_new_patient**: running twice with the same data will trigger a duplicate key error (same `patient_id`); use a different `patient_id` or drop the document first if re-running for demos.
- **04, 05, 08, 12**: updates/deletes; idempotent in the sense that running them again on the same dataset yields the same end state (e.g. same contact updated, same document deleted, same upsert result, same visits flagged).

## Performance Optimizations

1. **Query Optimization**
   - Filter early in pipelines to keep cursor volume minimal.
   - Project only the fields needed for dashboards and reports.
   - Sort after limiting result sets whenever possible.

2. **Data Modeling**
   - Embedded demographics inside patients for quick read access.
   - Arrays mirror the real-world structure of visits, prescriptions, and labs.
   - Designed queries to touch indexed fields such as department or chronic conditions.

3. **Index Strategy**
   - Created `department + visit_date` compound index for frequent filter+sort operations.
   - Indexed `medical_history.chronic_conditions` for analytic lookups.
   - Reused unique identifiers (`patient_id`, `result_id`) across scripts.

## Running Our Solution

1. **Start MongoDB (if it is not already running)**

   ```bash
   mongod --dbpath /path/to/data/directory
   ```

2. **Connect with mongosh**

   ```bash
   mongosh
   ```

3. **Use the production dataset**

   ```javascript
   use medical_database
   ```

4. **Run a query script**

   ```bash
   mongosh group-work/group_06/project/queries/01_patients_by_age_and_gender.mongosh.js
   ```

5. **Confirm state**

   ```javascript
   db.getCollectionNames();
   db.patients.countDocuments();
   ```

## Challenges and Solutions

### Challenge 1: Complex Aggregations

- **Problem**: Needed to analyze data across multiple collections
- **Solution**: Used `$lookup` stages with optimized pipeline order

### Challenge 2: Large Dataset Insertion

- **Problem**: Inserting millions of documents efficiently
- **Solution**: Implemented bulk write operations with ordered: false

### Challenge 3: Query Performance

- **Problem**: Slow queries on large collections
- **Solution**: Created appropriate compound indexes and used projection

## Testing & Validation

- Tested all queries with sample datasets
- Validated aggregation pipeline results
- Verified index effectiveness using explain()
- Ensured data integrity with validation rules

## Learning Outcomes

Through this project, we gained practical experience in:

- Database design patterns for NoSQL
- Writing efficient MongoDB queries
- Building complex aggregation pipelines
- Performance optimization techniques
- Data modeling best practices

## Future Enhancements

- Implement change streams for real-time data monitoring
- Add time-series collections for temporal data
- Explore sharding for horizontal scaling
- Implement schema versioning strategies

## Documentation

Additional files in our submission:

- `solution.md` - Complete write-up describing the group’s MongoDB queries and operations.
- `project/import_data.sh` - Script to import `project/data/*.json` into `medical_database` (run this before the query scripts).
- `project/queries/` - Twelve `mongosh` scripts covering the CRUD, aggregation, index, and reporting workflows discussed above.
- `project/data/` - Sample JSON exports (`patients.json`, `visits.json`, `lab_results.json`) used for testing these queries.

## Contributors

Group 06 - 2025
