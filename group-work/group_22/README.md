# Group 22 - MongoDB NoSQL Database Project

## Team Members

See our team composition in [group_members.md](../group_members.md#group-22)

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
   use group_22_db
   ```

4. **Execute Our Scripts**
   ```bash
   mongosh < solution.js
   ```

5. **Verify Data**
   ```javascript
   db.getCollectionNames()
   db.collection_name.countDocuments()
   ```

## Query Examples from Our Solution

### Example 1: Find Products by Category
```javascript
db.products.find({
  category: "Electronics",
  price: { $gte: 100, $lte: 1000 }
})
```

### Example 2: Aggregate Sales Data
```javascript
db.sales.aggregate([
  { $match: { year: 2024 } },
  { $group: {
    _id: "$month",
    totalSales: { $sum: "$amount" },
    avgSale: { $avg: "$amount" }
  }},
  { $sort: { _id: 1 } }
])
```

### Example 3: Update Inventory
```javascript
db.inventory.updateMany(
  { quantity: { $lt: 10 } },
  { $set: { status: "low_stock", lastUpdated: new Date() } }
)
```

## Performance Optimizations

1. **Query Optimization**
   - Used covered queries where possible
   - Implemented proper index strategies
   - Avoided full collection scans

2. **Data Modeling**
   - Balanced between embedding and referencing
   - Minimized document growth patterns
   - Optimized for read-heavy workloads

3. **Index Strategy**
   - Created indexes based on query patterns
   - Used compound indexes for sort operations
   - Monitored index usage with explain()

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
- `solution.md` - Complete MongoDB queries and operations
- `queries.js` - JavaScript file with all database operations
- `data.json` - Sample data for testing

## Contributors

Group 22 - 2025
