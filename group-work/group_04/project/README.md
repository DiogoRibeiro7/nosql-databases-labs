# Porto Airbnb Listings – NoSQL Database Project

This solution demonstrates a complete MongoDB implementation of a Porto Airbnb listings database. The project transforms the sample JSON data into an optimized document model, leveraging MongoDB's embedded documents and flexible schema design to support a vacation rental analytics platform with listings, hosts, and booking management.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `import_data.mongosh.js` | Bootstrap script that transforms JSON data into denormalized MongoDB collections. |
| `architecture.md` | Design rationale covering collection schemas, embedding strategies, and index decisions. |
| `data/` | Source JSON file with Porto Airbnb listings data. |
| `queries/01-16_*.mongosh.js` | Business intelligence queries covering pricing analysis, host insights, and inventory management. |
| `queries/17-19_*.mongosh.js` | CRUD operations demonstrating insert, update, and delete patterns. |
| `queries/20_aggregation_with_explain.mongosh.js` | Complex aggregation pipeline with forced collection scan (no indexes) for performance baseline. |
| `queries/20b_aggregation_with_explain.mongosh.js` | Same aggregation optimized with indexes for performance comparison. |
| `queries/21_collection_stats.mongosh.js` | Collection statistics and storage metrics. |
| `queries/index_blueprint.mongosh.js` | Idempotent script that creates all required indexes for optimal query performance. |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_04/project

# 1. Import data and create denormalized collections
mongosh import_data.mongosh.js

# 2. Create performance indexes
mongosh queries/index_blueprint.mongosh.js

# 3. Run business analytics queries
mongosh queries/01_top_listings_by_reviews.mongosh.js
mongosh queries/02_avg_price_by_neighbourhood.mongosh.js
mongosh queries/03_room_type_distribution.mongosh.js
mongosh queries/04_top_hosts_by_listings.mongosh.js
mongosh queries/05_listing_details.mongosh.js
mongosh queries/06_high_availability_listings.mongosh.js
mongosh queries/07_low_rated_listings.mongosh.js
mongosh queries/08_revenue_by_price_category.mongosh.js
mongosh queries/09_most_profitable_listings.mongosh.js
mongosh queries/10_booking_patterns_by_month.mongosh.js

# 4. Run operational queries
mongosh queries/11_host_performance_metrics.mongosh.js
mongosh queries/12_listings_without_bookings.mongosh.js
mongosh queries/13_neighbourhood_comparison.mongosh.js
mongosh queries/14_luxury_listings.mongosh.js
mongosh queries/15_listing_text_search.mongosh.js
mongosh queries/16_revenue_by_neighbourhood_roomtype.mongosh.js

# 5. Test CRUD operations
mongosh queries/17_insert_new_listing.mongosh.js
mongosh queries/18_update_listing_price.mongosh.js
mongosh queries/19_delete_test_listing.mongosh.js

# 6. Analyze performance (with and without indexes)
mongosh queries/20_aggregation_with_explain.mongosh.js
mongosh queries/20b_aggregation_with_explain.mongosh.js

# 7. Collection statistics
mongosh queries/21_collection_stats.mongosh.js
```

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you use a different URI, export the `MONGODB_URI` environment variable before running the commands.

## Scenario Summary

- **Business driver**: A vacation rental analytics platform needs real-time insights into pricing patterns, host performance, booking trends, and market segmentation across Porto neighbourhoods.
- **Key entities**: `listings` (properties with embedded host info, location, and reviews), `hosts` (aggregated host metrics), `bookings` (transactional data with guest and pricing info).
- **Why mongosh only?** Pure mongosh scripts ensure reproducibility without requiring Node.js driver dependencies or external tooling. Each script is idempotent and self-contained.

## Data Model Highlights

### Denormalization Strategy

The sample data is transformed into an optimized document model with strategic embedding:

1. **Listings Collection**: Embeds host info, location coordinates, capacity details, booking rules, and review summaries for single-document property profiles.
2. **Hosts Collection**: Aggregated metrics including listings count, neighbourhoods served, average pricing, and total capacity.
3. **Bookings Collection**: Transactional records with embedded guest info and listing references for fast revenue analysis.

### Performance Optimizations

- Compound indexes on `listings` collection for neighbourhood, room type, and price queries
- Text index on listing names for search functionality
- Single-field indexes on frequently queried fields (listing_id, host_id, status)
- Strategic use of covered queries where projections match index fields

## Key Query Patterns Demonstrated

| Pattern | Description | Collections |
| ------- | ----------- | ----------- |
| Pricing Analysis | Average prices, price categories, luxury segment | listings |
| Host Insights | Top hosts, performance metrics, multi-listing hosts | hosts, listings, bookings |
| Market Segmentation | Room type distribution, neighbourhood comparison | listings |
| Booking Analytics | Revenue by category, monthly patterns, profitable listings | bookings, listings |
| Inventory Management | Availability analysis, underperforming listings | listings, bookings |
| Performance Testing | Index impact measurement via complex aggregations | bookings, listings |

## Index Performance Comparison

The project includes two versions of a complex aggregation query to demonstrate the impact of indexes:

- **Query 20 (No Indexes)**: Forces collection scan using `hint: {$natural: 1}` to establish a performance baseline.
- **Query 20b (With Indexes)**: Same aggregation but leverages compound indexes for optimized execution.

## Technologies & Tools Used

- **Database**: MongoDB 7.0+
- **Shell**: MongoDB Shell (mongosh)
- **Query Language**: MongoDB Query Language (MQL)
- **Data Source**: Porto Airbnb Listings (JSON)
- **Visualization**: MongoDB Compass (optional)

## Query Summary

| # | Query | Type | Description |
|---|-------|------|-------------|
| 01 | Top Listings by Reviews | Analytics | Most popular properties for marketing |
| 02 | Avg Price by Neighbourhood | Analytics | Market pricing analysis |
| 03 | Room Type Distribution | Analytics | Property portfolio breakdown |
| 04 | Top Hosts by Listings | Analytics | Professional host identification |
| 05 | Listing Details | Lookup | Customer service dashboard |
| 06 | High Availability Listings | Filter | Investment opportunities |
| 07 | Low-Rated Listings | Filter | Quality control |
| 08 | Revenue by Price Category | Aggregation | Financial segmentation |
| 09 | Most Profitable Listings | Aggregation | Revenue leaders |
| 10 | Booking Patterns by Month | Aggregation | Seasonal analysis |
| 11 | Host Performance Metrics | Aggregation | Host evaluation |
| 12 | Listings Without Bookings | Comparison | Underperforming inventory |
| 13 | Neighbourhood Comparison | Aggregation | Geographic dashboard |
| 14 | Luxury Listings | Filter | Premium market segment |
| 15 | Text Search | Search | Search functionality |
| 16 | Revenue by Neighbourhood & Room Type | Aggregation | Cross-dimensional analysis |
| 17 | Insert New Listing | CRUD - Create | Insert operation |
| 18 | Update Listing Price | CRUD - Update | Update operation |
| 19 | Delete Test Listing | CRUD - Delete | Delete operation |
| 20 | Aggregation (No Indexes) | Performance | Baseline measurement |
| 20b | Aggregation (With Indexes) | Performance | Optimized measurement |
| 21 | Collection Statistics | Admin | Database metrics |

## Contributors

#### GROUP 04 - TSIW - 2026

| Name | Number | Email |
|------|--------|-------|
| [Add team member] | [Number] | [Email] |
| [Add team member] | [Number] | [Email] |
| [Add team member] | [Number] | [Email] |

## Teacher

Prof. Diogo Filipe de Bastos Sousa Ribeiro
