# Group 12 - MongoDB NoSQL Database Project - Food Express

## Group Information

**Group Number:** group_12
**Submission Date:** 2026-01-30

### Team Members

| Name              | Student ID            | Email                 | Contribution % |
| ----------------- | --------------------- | --------------------- | -------------- |
| Martim Ferreira   | 40230105              | 40230105@esmad.ipp.pt | 30%            |
| Pedro Lobão       | 40230121              | 40230121@esmad.ipp.pt | 35%            |
| Gonçalo Abreu     | 40230363              | 40230363@esmad.ipp.pt | 35%            |

**Total:** 100%

## Project Overview

For the food express project, we built a MongoDB database to manage a food delivery service. The system handles restaurants, customers, and orders. We focused on designing efficient data models, optimizing queries for speed, and using aggregations to gather insights about sales and delivery operations.


## Learning Objectives Achieved

- Schema Architecture: Leveraged embedding for menu items to ensure rapid data retrieval, while utilizing references for order history to prevent issues with unbounded arrays.
- Advanced Aggregation: Engineered complex data processing pipelines with stages like `$lookup`, `$unwind`, and `$group` to synthesize data.
- Query Performance: Deployed Compound and Text Indexes to accelerate search and sort operations, following the Equality-Sort-Range (ESR) methodology.
- Logic Implementation: Applied advanced filtering operators such as `$in`, `$gte`, and Regex to facilitate detailed analysis of delivery logistics and sales.

## Database Design

- restaurants: Primary collection featuring embedded structures for menu items and operating schedules to enhance read efficiency and data locality.
- orders: Distinct collection utilizing references (restaurantId, customer_id) to manage extensive transaction histories while avoiding document size constraints.
- reviews: Standalone collection associated with restaurants, designed to handle a high volume of customer feedback.

## Schema Design Decisions
- Denormalization Strategy: We employed references for `restaurantId` within the orders and reviews collections to support scalable one-to-many relationships.
- Type Consistency: Verified that all temporal data is stored as `ISODate` to facilitate accurate date-range filtering and duration calculations.

## Data Operations Implemented

### 1. Database Creation & Setup

- Created database with appropriate naming conventions
- Established collections with validation rules

### 2. Data Insertion

We utilize standard Bulk Import operations via mongoimport to efficiently load the synthetic JSON records from the DATA folder into the lab_nosql database.

### 3. Query Operations

#### Basic Queries

- Data Fetching: Performed standard `find()` queries with exact matches and dot notation to retrieve specific embedded details.
- Boolean Logic: Applied logical operators such as `$or` and `$in` to filter records based on multiple conditions in a single pass.
- Projection: Used field selection to return only relevant data points, reducing network load.

#### Advanced Queries

- Text Search: Utilized `$regex` for pattern matching to enable flexible searching within text fields like names and descriptions.
- Value Ranges: Implemented comparison operators like `$gte` and `$lt` to filter numerical data such as prices and ratings.
- Data Analysis: Constructed grouping stages to compute aggregates like sums and averages for operational insights.

### 4. Aggregation Pipelines

#### Complex Aggregations

- Data Joining: Built pipelines with `$lookup` to correlate documents from different collections, simulating relational joins.
- Array Processing: Used `$unwind` to flatten array fields, enabling detailed analysis of individual list items.
- Logic Application: Integrated specific filtering criteria within pipeline stages to address complex business questions involving multiple data entities.


## Technologies & Tools Used

- **Database**: MongoDB 7.0
- **Shell**: MongoDB Shell (mongosh)
- **Query Language**: MongoDB Query Language (MQL)
- **Tools**: MongoDB Compass for visualization
- **Scripts**: JavaScript for database operations

## Database Setup Instructions 

### Prerequisites

- MongoDB 7.0 or Higher installed locally.
- MongoDB Shell (mongosh) installed.
- MongoDB Compass (optional, for GUI access).

### Running Our Solution ( 2 ways )

1. **Manual Import and Execution**
Import Data: Run the following commands in your terminal from the project folder to populate the database:

   ```bash
mongoimport --db lab_nosql --collection restaurants --file "./data/restaurants.json" --jsonArray
mongoimport --db lab_nosql --collection orders --file "./data/orders.json" --jsonArray
   ```

2. **Connect to MongoDB**

   ```bash
   mongosh
   ```

3. **Create and Use Database**

   ```javascript
   use lab_nosql
   ```

4. **Execute Queries**

   ```bash
   // Copy and paste any query from the queries folder
   ```

5. **Test: Find Restaurants with Italian Cuisine**

```javascript
db = db.getSiblingDB("lab_nosql");
print("List of Restaurants with Italian Cuisine:");
db.restaurants
  .aggregate([
    { $match: { "cuisine": "Italian" } },
    {
      $project: {
        _id: 0,
        "cuisine": 1,
        "name": 1,
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

## Performance and Indexing Strategy

We analyzed the execution plans for our primary queries to ensure optimal performance.

1. **Load "index_setup.js"**

2. **Use any of the queries with "..._With_Index.js"**

these queries contain `.explain("executionStats")`

3. **Check the output for 'IXSCAN' (Index Scan) versus 'COLLSCAN' (Collection Scan).**

## Performance Optimizations

- **ESR Adherence**: We structured our indexes based on the Equality, Sort, Range principle to maximize query efficiency.
- **Field Projection**: We consistently applied `$project` stages to limit data transfer to only essential fields.
- **Pipeline Efficiency**: We placed `$match` stages at the beginning of pipelines to filter data early, reducing the load on subsequent stages like `$lookup`.

## Challenges and Solutions

### Challenge 1: Analyzing Nested Status Histories

- **Issue**: Order status updates were stored in an embedded array, making chronological sorting and analysis difficult with standard find operations.
- **Resolution**: We implemented the `$unwind` aggregation stage to flatten the array into individual documents, allowing for precise sorting by timestamp.

### Challenge 2: Team Collaboration on Database Scripts

- **Issue**: Managing concurrent edits to query scripts and data files led to version control conflicts.
- **Resolution**: We adopted a feature-branch workflow and communicated changes to the file structure before merging to the main branch.

### Challenge 3: Tooling Consistency

- **Issue**: Discrepancies in `mongoimport` versions across different operating systems caused data ingestion failures.
- **Resolution**: We standardized our development environment setup and documented the specific tool versions required for the project.

## Testing & Validation

- Verified query correctness against a known sample dataset.
- Cross-referenced aggregation results with manual calculations.
- Confirmed index usage and performance gains using `.explain()`.
- Tested schema validation by attempting to insert invalid documents.

## Learning Outcomes

This project provided hands-on experience in:

- Architecting hybrid NoSQL data models.
- Constructing multi-stage aggregation pipelines for business intelligence.
- Optimizing database read performance through indexing.
- Manipulating nested document structures.
- Managing a collaborative database development workflow.

## Declaration

We declare that this submission is our own work and that all sources used have been properly cited.

## Contributors

Martim Ferreira, Pedro Lobão, Gonçalo Abreu.
Group 12