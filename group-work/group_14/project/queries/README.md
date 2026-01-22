# Group 14 - MongoDB NoSQL Database Project - Medical Records System

## Group Information

**Group Number:** group_14
**Submission Date:** 2026-01-22

### Team Members

| Name | Student ID | Email | Contribution % |
| ---- | ---------- | ----- | -------------- |
| Gonçalo Duarte | 40240223 | 40240223@esmad.ipp.pt| 33% |
| Lucas Silva | 40240224 | 40240223@esmad.ipp.pt | 34% |
| Sérgio Gonçalves. | TBD | TBD | 33% |

**Total:** 100%

## Project Overview

This project implements a clinical data analysis system using MongoDB. We developed a comprehensive solution for managing patient records, medical visits, and lab results, demonstrating the ability to model complex healthcare data, optimize query performance, and derive insights through aggregation pipelines within the Portuguese SNS context.

## Learning Objectives Achieved

- Schema Design: Applied embedding strategies for medical history (fast reads) versus referencing for visits (avoiding unbounded arrays);
- Aggregation Mastery: Mastered multi-stage pipelines using $lookup, $unwind, $group, $project, $sort, and $limit;
- Performance: Implemented Compound and Text Indexes to support efficient filtering and sorting (Rule ESR);
- Business Logic: Implemented complex filtering using $in, $gte, and Regex for clinical risk assessment.

## Database Design

- patients: Core collection with Embedded arrays (medications, allergies, chronic_conditions) to prioritize data locality and read performance;
- visits: Separate collection using Referencing (patient_id) to handle potentially large visit histories without hitting the 16MB document limit;
- lab_results: Independent collection linked to patients, simulating high-volume ingestion from laboratory equipment.

## Schema Design Decisions
- Denormalization: We referenced the patient_id in visits and results to allow for scalable growth (1-to-Many relationships);
- Data Types: Ensured dates are stored as ISODate for correct range queries and calculations.

## Data Operations Implemented

### 1. Database Creation & Setup

- Created database with appropriate naming conventions
- Established collections with validation rules

### 2. Data Insertion

We utilize standard Bulk Import operations via mongoimport to efficiently load the synthetic JSON records from the DATA folder into the lab_results database.

### 3. Query Operations

#### Basic Queries

- Data Retrieval: Execution of fundamental 'find()' operations using precise equality matches and dot notation for accessing embedded fields;
- Logical Operators: Implementation of complex boolean logic 'OR/AND' using operators like '$in' to efficienty filter documents based on multiple criteria within a single query execution;
- Field Selection: Utilization of projections to limit the returned data, optimizing network bandwidth by retrieving only the necessary fields for the application context.

#### Advanced Queries

- Pattern Matching: Application of regular expressions '$regex' to perform flexible text searches within unstructured string fields;
- Range Filtering: Use of comparison operators such as 'gte', '$lt' to analyze numerical data points and filter records based on specific threshold values;
- Statistical Grouping: Implementation of grouping stages to calculate counts, sums, and averages, enabling the extraction of high-level operational metrics from raw data.

### 4. Aggregation Pipelines

#### Complex Aggregations

- Relational Joins: Development of multi-stage pipelines using '$lookup' to join related documents across different collections, mimicking relational behavior in a NoSQL environment;
- Array Manipulation: Advanced handling of embedded arrays using '$unwind' to deconstruct lists into individual documents for granular sorting and filtering;
- Business Logic Implementation: Application of specific filtering rules within aggregation stages to answer complex domain-specific questions that require traversing multiple data structures.


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

### Running Our Solution ( 2 ways )

1. **Import Data**
Run the following commands in your terminal (from the project folder):

   ```bash
mongoimport --db lab_results --collection results --file "...\data\lab_results.json" --jsonArray
mongoimport --db lab_results --collection patients --file "...data\patients.json" --jsonArray
mongoimport --db lab_results --collection visits --file "...\data\visits.json" --jsonArray
   ```

2. **Connect to MongoDB**

   ```bash
   mongosh
   ```

3. **Create and Use Database**

   ```bash
   use lab_results
   ```

4. **Execute Our Queries**

   ```bash
   copy any querie
   ```

5. **Test: Find Patients with O+ Blood Type**

```javascript
db = db.getSiblingDB("lab_results");
print("List of Patients with O+ Blood Type:");
db.patients
  .aggregate([
    { $match: { "demographics.blood_type": "O+" } },
    {
      $project: {
        _id: 0,
        "demographics.blood_type": 1,
        "demographics.full_name": 1,
      },
    },
  ]).forEach((doc) => printjson(doc));

```
# OR

1. **Connect to MongoDB from the queries folder**

   ```bash
   mongosh
   ```

2. **Load any querie**

    ```bash
load ("NameOfTheQuerie.js")
    ```
**The Result Should appear in the terminal**

## Performance Optimizations

- Rule ESR: Queries were designed keeping Equality, Sort, and Range in mind;
- Projection: Heavily utilized $project to minimize network overhead;
- Pipeline Order: Ensured $match stages occur as early as possible to reduce dataset size before joins.

## Challenges and Solutions

### Challenge 1: Sorting Embedded Chronological Data

- **Problem**: We needed to order surgeries chronologically, but they were stored inside an embedded array (Query 15), which standard sort operations cannot handle directly.
- **Solution**: We applied the `$unwind` stage to deconstruct the array into individual documents, allowing us to perform a global `$sort` on the date field.

### Challenge 2: Adapting to Collaborative Version Control

- **Problem**: As this was our first large-scale project using GitHub as a team, managing branches and the directory structure initially led to synchronization issues.
- **Solution**: We established a clear workflow, communicating frequently before pushing code and adhering strictly to the required folder structure to avoid merge conflicts.

### Challenge 3: Local Environment Configuration

- **Problem**: Setting up the MongoDB local server, configuring system PATH variables, and ensuring the Database Tools (specifically mongoimport) were correctly installed on different operating systems proved difficult.
- **Solution**: We standardized the installation process across the team and verified the environment setup before starting the data ingestion phase.

## Testing & Validation

- Tested all queries with sample datasets
- Validated aggregation pipeline results
- Verified index effectiveness using explain()
- Ensured data integrity with validation rules

## Learning Outcomes

Through this project, we gained practical experience in:

- Designing Hybrid NoSQL Data Models
- Building Complex Aggregation Pipelines
- Optimizing Query Performance via Indexing
- Handling Embedded Array Structures
- Configuring Local MongoDB Environments
- Managing Collaborative Git Workflows

## Declaration

We declare that this submission is our own work and that all sources used have been properly cited.

## Contributors

Gonçalo Duarte, Lucas Silva, Sérgio Gonçalves.
Group 14 - 2026
