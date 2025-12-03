# Lab 01 - Notes

## Student Information
- **Lab**: Lab 01 - Introduction to NoSQL & Setup
- **Database**: `lab01_student`
- **Collection**: `customers`

---

## 1. Setup and Installation

### Prerequisites
- MongoDB installed locally
- MongoDB shell (`mongosh`) available in PATH

### MongoDB Setup
Ensure MongoDB is installed and running locally.

Connect to MongoDB shell:
```bash
mongosh
```

---

## 2. Data Import

### 2.1. Import the Sample Data

We use mongosh with JavaScript scripts to import data (no need for mongoimport).

**Method 1: Using the import script (Recommended):**
```bash
# Navigate to the lab directory
cd labs/lab01_intro

# Run the import script
mongosh --file import_data.js
```

**Method 2: From within mongosh:**
```javascript
// Start mongosh
mongosh

// Load the import script
load('labs/lab01_intro/import_data.js')
```

**Method 3: Reset database with fresh data:**
```bash
# This removes all data and starts fresh
mongosh --file reset_database.js
```

### 2.2. Verify Import
After importing, verify the data:

```javascript
// In mongosh
use lab01_student
db.customers.countDocuments()  // Should return 5
db.customers.find().pretty()
```

---

## 3. Available Scripts

### 3.1. Script Files
- **`import_data.js`**: Sets up database with initial 5 customers
- **`queries.js`**: Contains all lab queries and operations (handles duplicates)
- **`reset_database.js`**: Clears and reinitializes database to fresh state
- **`test_setup.js`**: Verifies MongoDB and database setup
- **`test_queries.js`**: Tests a subset of queries

### 3.2. Running the Queries

1. **Method 1: Run directly from terminal**
   ```bash
   cd labs/lab01_intro
   mongosh --file queries.js
   ```

2. **Method 2: Load from within mongosh**
   ```javascript
   mongosh
   use lab01_student
   load("queries.js")
   ```

3. **Method 3: Copy-paste individual queries**
   - Open `queries.js` in an editor
   - Copy specific queries
   - Paste into mongosh shell

### 3.3. Query Categories

The `queries.js` file contains:
1. **Insert Operations**: Adding 3 new customers
2. **Basic Queries**: Finding customers by various criteria
3. **Update Operations**: Modifying customer data
4. **Aggregations**: Computing statistics and grouping data
5. **Delete Operations**: Removing documents (commented out for safety)
6. **Indexes**: Creating and analyzing indexes
7. **Advanced Queries**: Sorting, pagination, and regex searches
8. **Comments**: Instructions for data export/import (requires MongoDB Database Tools if needed)

---

## 4. Indexes

### 4.1. Why Indexes Are Important

Indexes significantly improve query performance, especially as data grows.

### 4.2. Indexes Created

1. **Index on `city`**
   - **Purpose**: Speeds up queries filtering by city
   - **Query example**: `db.customers.find({ city: "New York" })`
   - **Trade-off**: Slightly slower inserts, minimal storage overhead

2. **Index on `country`**
   - **Purpose**: Improves aggregation performance for country-based statistics
   - **Query example**: Country grouping in aggregations
   - **Trade-off**: Better for read-heavy workloads

3. **Compound Index on `age` and `balance`**
   - **Purpose**: Optimizes queries filtering by age and sorting by balance
   - **Query example**: Finding wealthy customers in specific age ranges
   - **Trade-off**: More storage, but very efficient for combined queries

4. **Unique Index on `email`**
   - **Purpose**: Ensures email uniqueness and speeds up email lookups
   - **Query example**: `db.customers.find({ email: "alice@example.com" })`
   - **Trade-off**: Prevents duplicate emails, enforces data integrity

### 4.3. Verifying Index Usage

Use the `explain()` method to verify that indexes are being used:

```javascript
db.customers.find({ city: "New York" }).explain("executionStats")
```

Look for:
- `"stage": "IXSCAN"` (Index Scan) - Good! Index is being used
- `"stage": "COLLSCAN"` (Collection Scan) - Bad! Full table scan

---

## 5. Key Learnings

### 5.1. CRUD Operations
- **Create**: `insertOne()`, `insertMany()`
- **Read**: `find()`, `findOne()`, with filtering and projection
- **Update**: `updateOne()`, `updateMany()`, `replaceOne()`
- **Delete**: `deleteOne()`, `deleteMany()`

### 5.2. Query Operators
- Comparison: `$gt`, `$gte`, `$lt`, `$lte`, `$eq`, `$ne`
- Logical: `$and`, `$or`, `$not`, `$nor`
- Array: `$in`, `$nin`, `$all`
- Text: `$regex`

### 5.3. Aggregation Framework
- `$group`: Group documents by field(s)
- `$match`: Filter documents
- `$sort`: Sort results
- `$project`: Shape output documents
- `$bucket`: Create buckets for categorization
- Aggregation operators: `$sum`, `$avg`, `$min`, `$max`, `$push`

### 5.4. Index Types
- **Single Field**: Index on one field
- **Compound**: Index on multiple fields
- **Unique**: Enforces uniqueness
- **Text**: For text search (not demonstrated here)
- **Geospatial**: For location queries (not demonstrated here)

---

## 6. Issues Encountered and Solutions

### 6.1. Authentication Issues
**Issue**: Could not connect to MongoDB without credentials.

**Solution**: If your MongoDB installation requires authentication, use credentials:
```bash
mongosh -u yourUsername -p yourPassword --authenticationDatabase admin
```

### 6.2. Script Path Issues
**Issue**: mongosh couldn't find the import script file.

**Solution**: Navigate to the correct directory or use full path:
```bash
# Option 1: Navigate to directory first
cd labs/lab01_intro
mongosh --file import_data.js

# Option 2: Use full path from mongosh
mongosh
load('/full/path/to/labs/lab01_intro/import_data.js')
```

### 6.3. Duplicate Key Error
**Issue**: After creating unique index on email, couldn't insert duplicate emails when running queries.js multiple times.

**Solution**: The queries.js file now handles duplicates gracefully with try-catch. If you want to start fresh:
```bash
# Reset the database to initial state
mongosh --file reset_database.js

# Then run queries
mongosh --file queries.js
```

---

## 7. Performance Observations

### Without Indexes
- Query on city: ~0.5ms (small dataset, but would scale poorly)
- Aggregation by country: Full collection scan

### With Indexes
- Query on city: ~0.1ms (using index)
- Aggregation by country: Index scan, much faster on large datasets

**Recommendation**: Always create indexes on fields used in:
- `WHERE` clauses (filters)
- `GROUP BY` operations
- `ORDER BY` sorting
- `JOIN` lookups (in MongoDB: `$lookup`)

---

## 8. Working with mongosh (No mongoimport Needed)

### Why We Use mongosh Scripts Instead of mongoimport

1. **Single Tool**: Everything works with just mongosh - no need for separate Database Tools
2. **Flexibility**: JavaScript scripts can include logic, error handling, and data generation
3. **Portability**: Scripts work on any system with mongosh installed
4. **Learning**: Better understanding of MongoDB operations through JavaScript

### Common Operations

```javascript
// Import data from a script
mongosh --file import_data.js

// Reset database
mongosh --file reset_database.js

// Run queries
mongosh --file queries.js

// Interactive mode
mongosh
use lab01_student
db.customers.find()
```

## 9. Next Steps

For further practice:
1. Create a larger dataset (1000+ documents) to see performance differences
2. Experiment with different index types
3. Use the aggregation pipeline for more complex analytics
4. Try geospatial queries if working with location data
5. Explore MongoDB Atlas for cloud deployment

---

## 10. References

- [MongoDB Official Documentation](https://docs.mongodb.com/)
- [mongosh Documentation](https://docs.mongodb.com/mongodb-shell/)
- [MongoDB CRUD Operations](https://docs.mongodb.com/manual/crud/)
- [Aggregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes/)
