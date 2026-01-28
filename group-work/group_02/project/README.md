# Sakila DVD Rental Store – NoSQL Database Project

This solution demonstrates a complete MongoDB implementation of the classic Sakila DVD rental database. The project transforms a normalized relational schema into an optimized document model, leveraging MongoDB's embedded documents and flexible schema design to support a video rental business with physical stores, inventory management, and customer analytics.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `import_data.mongosh.js` | Bootstrap script that transforms relational Sakila data (CSV/JSON) into denormalized MongoDB collections. |
| `architecture.md` | Design rationale covering collection schemas, embedding strategies, and index decisions. |
| `data/` | Source CSV and JSON files extracted from the original Sakila relational database. |
| `queries/01-16_*.mongosh.js` | Business intelligence queries covering revenue analysis, customer insights, and inventory management. |
| `queries/17-19_*.mongosh.js` | CRUD operations demonstrating insert, update, and delete patterns. |
| `queries/20_aggregation_with_explain.mongosh.js` | Complex aggregation pipeline with forced collection scan (no indexes) for performance baseline measurement. |
| `queries/20b_aggregation_with_explain.mongosh.js` | Same complex aggregation pipeline optimized with indexes for performance comparison. Automatically loads and executes `index_blueprint.mongosh.js` to ensure indexes exist. |
| `queries/21_collection_stats.mongosh.js` | Collection statistics and storage metrics. |
| `queries/22-26_*.mongosh.js` | Advanced analytical queries for location analysis, duration patterns, and bulk operations. |
| `queries/index_blueprint.mongosh.js` | Idempotent script that drops existing indexes and recreates all required indexes for optimal query performance. |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_02/project

# 1. Import Sakila data and create denormalized collections
mongosh import_data.mongosh.js

# 2. Create performance indexes
mongosh queries/index_blueprint.mongosh.js

# 3. Run business analytics queries
mongosh queries/01_top_renting_customers.mongosh.js
mongosh queries/02_revenue_by_film_category.mongosh.js
mongosh queries/03_active_rentals_by_store.mongosh.js
mongosh queries/04_most_popular_actors.mongosh.js
mongosh queries/05_customer_rental_history.mongosh.js
mongosh queries/06_film_inventory_availability.mongosh.js
mongosh queries/07_overdue_rentals.mongosh.js
mongosh queries/08_revenue_by_rating.mongosh.js
mongosh queries/09_most_profitable_films.mongosh.js
mongosh queries/10_rental_patterns_by_month.mongosh.js

# 4. Run operational queries
mongosh queries/11_staff_performance_metrics.mongosh.js
mongosh queries/12_inactive_customers.mongosh.js
mongosh queries/13_store_comparison_metrics.mongosh.js
mongosh queries/14_never_rented_films.mongosh.js
mongosh queries/15_film_text_search.mongosh.js
mongosh queries/16_revenue_by_store_category.mongosh.js

# 5. Test CRUD operations
mongosh queries/17_insert_new_customer.mongosh.js
mongosh queries/18_update_customer.mongosh.js
mongosh queries/19_delete_test_customer.mongosh.js

# 6. Analyze performance (with and without indexes)
# First, run without indexes for baseline (automatically deletes indexes and compares)
mongosh queries/20_aggregation_with_explain.mongosh.js

# Then run optimized version (automatically creates indexes and compares)
mongosh queries/20b_aggregation_with_explain.mongosh.js

# Collection statistics
mongosh queries/21_collection_stats.mongosh.js

# 7. Advanced analytics
mongosh queries/22_customers_by_location.mongosh.js
mongosh queries/23_film_duration_analysis.mongosh.js
mongosh queries/24_rentals_by_weekday.mongosh.js
mongosh queries/25_films_with_most_actors.mongosh.js
mongosh queries/26_bulk_update_inventory.mongosh.js
```

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you use a different URI, export the `MONGODB_URI` environment variable before running the commands.

## Scenario Summary

- **Business driver:** A DVD rental chain needs real-time insights into rental patterns, revenue optimization, inventory allocation, and customer retention strategies across multiple store locations.
- **Key entities:** `films` (catalog with embedded categories and actors), `customers` (profiles with embedded addresses), `rentals` (transactional facts with embedded payment data), `inventory` (availability tracking), `stores` (location reference data).
- **Why mongosh only?** Pure mongosh scripts ensure reproducibility without requiring Node.js driver dependencies or external tooling. Each script is idempotent and self-contained.

## Data Model Highlights

### Denormalization Strategy

The original Sakila relational schema requires 5-7 table JOINs for common queries. The MongoDB implementation reduces this complexity through strategic embedding:

1. **Films Collection:** Embeds language, category, and actors array, eliminating film_actor and film_category join tables.
2. **Customers Collection:** Embeds full address hierarchy (address, city, country) for single-document customer profiles.
3. **Rentals Collection:** Embeds payment information and includes film/customer references for fast transactional queries.

### Performance Optimizations

- **Compound indexes** on `rentals` collection for date range and customer lookups
- **Text index** on film titles and descriptions for search functionality
- **Single-field indexes** on frequently queried fields (customer_id, film_id, store_id)
- Strategic use of **covered queries** where projections match index fields

## Key Query Patterns Demonstrated

| Query Type | Examples | Collections Used |
|------------|----------|------------------|
| Revenue Analysis | Total revenue by category, rating, store, time period | rentals, films |
| Customer Insights | Top customers, inactive accounts, repeat rental patterns | customers, rentals |
| Inventory Management | Film availability, never-rented titles, stock allocation | inventory, films, rentals |
| Operational Metrics | Staff performance, store comparisons, overdue tracking | rentals, stores, customers |
| Analytics | Geographic distribution, temporal patterns, actor popularity | customers, rentals, films |
| Performance Testing | Index impact measurement via complex aggregations with/without indexes | rentals, customers |

## Index Performance Comparison

The project includes two versions of a complex aggregation query to demonstrate the impact of indexes:

- **Query 20 (No Indexes):** Forces collection scan using `hint: {$natural: 1}` to establish a performance baseline. Scans all documents sequentially without index assistance.
- **Query 20b (With Indexes):** Same aggregation but automatically loads and executes `index_blueprint.mongosh.js` at startup to ensure all indexes are created, then leverages compound and unique indexes on `rental_date`, `customer_id`, and `store_id` for optimized execution.

The complex pipeline includes:
- Date range filtering on rental_date
- $lookup joins with customers collection
- Multi-field grouping with country aggregation
- Computed fields (unique customer counts, average revenue per rental)

This comparison allows direct measurement of index effectiveness on realistic business queries involving multiple collections and aggregation stages.

## Technologies & Tools Used

- **Database:** MongoDB 7.0+
- **Shell:** MongoDB Shell (mongosh)
- **Query Language:** MongoDB Query Language (MQL)
- **Data Source:** Sakila Sample Database (MySQL)
- **Visualization:** MongoDB Compass (optional)

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
   use group_02_db
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

## Query Examples from Our Solution

### Example 1: Find Products by Category

```javascript
db.products.find({
  category: "Electronics",
  price: { $gte: 100, $lte: 1000 },
});
```

### Example 2: Aggregate Sales Data

```javascript
db.sales.aggregate([
  { $match: { year: 2024 } },
  {
    $group: {
      _id: "$month",
      totalSales: { $sum: "$amount" },
      avgSale: { $avg: "$amount" },
    },
  },
  { $sort: { _id: 1 } },
]);
```

### Example 3: Update Inventory

```javascript
db.inventory.updateMany(
  { quantity: { $lt: 10 } },
  { $set: { status: "low_stock", lastUpdated: new Date() } }
);
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

### Team Reflection

- **Collaboration & Version Control:** We identified that some of us need to strengthen the Git and GitHub skills, specifically regarding branch management and collaborative workflow patterns.
- **Project Scoping:** Navigating a large repository with extensive requirements was a learning curve. This experience taught us how to decompose complex tasks into manageable sub-goals.
- **Agile Adaptation:** Managing the workload within the time constraints required us to prioritize core features and optimize our communication as a team.

### Insights on MongoDB & NoSQL

- **Market Relevance:** We recognize that proficiency in NoSQL is essential for modern web-scale applications, where document-oriented databases are often preferred for their flexibility and performance.
- **Schema Flexibility:** We found that the lack of rigid schemas allowed us to make faster adjustments during the data transformation process, demonstrating how NoSQL can accelerate development cycles.
- **The Denormalization Mindset:** Transitioning from the normalized Sakila SQL model to a document-oriented structure was a major shift in our thinking, particularly regarding the trade-offs between storage redundancy and query speed.
- **Practical Optimization:** Learning to use profiling tools like `explain()` and implementing strategic compound indexes gave us hands-on proof of the performance gains possible in MongoDB.

## Contributors

#### GROUP 02 - TSIW - 2026

| Student | ID | Email |
| --- | --- | --- |
| António Manuel Cruz Barreto Amorim | 40240119 | 40240119@esmad.ipp.pt |
| Gabriel de Sousa Paiva | 40240137 | 40240137@esmad.ipp.pt |
| Emanuel José Fernandes Gomes | 40230432 | 40230432@esmad.ipp.pt |

## Teacher

Prof. Diogo Filipe de Bastos Sousa Ribeiro
