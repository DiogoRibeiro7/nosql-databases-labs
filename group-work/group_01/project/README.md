# Flight Management System – Final Project

This project implements a comprehensive MongoDB-based flight management system that tracks airline operations, flight schedules, and passenger reservations. The system demonstrates advanced NoSQL database design patterns, query optimization, and analytical capabilities for real-world airline operations.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `import_data.mongosh.js` | Bootstrap script that creates the `group_01_flight_management_system_final` database and loads data from JSON files. |
| `architecture.md` | Written rationale for collections, embedding vs referencing strategy, relationships, and index blueprint. |
| `performance.md` | Query performance analysis, index coverage, and explain outputs for key operations. |
| `data/` | JSON files containing airlines, airports, countries, flights, reservations, and users data. |
| `queries/0*_*.mongosh.js` | Twenty mongosh scripts covering CRUD operations, analytics, and business intelligence queries. |
| `queries/index_blueprint.mongosh.js` | Idempotent script that creates all necessary indexes for optimal query performance. |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_01/project

# 1. Seed the database with data from JSON files
mongosh import_data.mongosh.js

# 2. Create indexes for optimal performance
mongosh queries/index_blueprint.mongosh.js

# 3. Run individual queries to explore the system
mongosh queries/01_create_flight_reservation.mongosh.js
mongosh queries/02_update_user_email.mongosh.js
mongosh queries/03_cancel_all_airport_flights.mongosh.js
mongosh queries/04_find_user_reservations.mongosh.js
mongosh queries/05_check_flight_available_seats.mongosh.js
mongosh queries/06_daily_flights_by_airport.mongosh.js
mongosh queries/07_list_airports_in_city.mongosh.js
mongosh queries/08_upcoming_airport_landings.mongosh.js
mongosh queries/09_last_call_flights_status.mongosh.js
mongosh queries/10_airlines_operating_at_airport.mongosh.js
mongosh queries/11_find_flights_by_route_and_date.mongosh.js
mongosh queries/12_cheapest_flights_by_route.mongosh.js
mongosh queries/13_total_revenue_by_airline.mongosh.js
mongosh queries/14_most_popular_routes.mongosh.js
mongosh queries/15_average_flight_duration_by_route.mongosh.js
mongosh queries/16_users_with_most_reservations.mongosh.js
mongosh queries/17_flights_with_low_occupancy.mongosh.js
mongosh queries/18_customer_lifetime_value.mongosh.js
mongosh queries/19_cancellation_analysis_by_route.mongosh.js
mongosh queries/20_find_flights_by_price_range.mongosh.js
```

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you need to connect to a different URI, export `MONGODB_URI` before running the commands:

```bash
export MONGODB_URI="mongodb://your-host:27017"
mongosh import_data.mongosh.js
```

## Executive Summary

### Business Context

The Flight Management System is designed to support airline operations and business intelligence needs. The system enables:

- **Operational Management**: Track flight schedules, capacity, and status updates
- **Customer Service**: Manage reservations, user accounts, and customer inquiries
- **Business Analytics**: Analyze revenue, route popularity, customer lifetime value, and operational efficiency
- **Strategic Planning**: Identify underperforming routes, optimize pricing, and understand customer behavior patterns

### System Capabilities

The system provides 20+ comprehensive queries covering:

1. **Reservation Management** – Create, update, and query flight reservations
2. **User Management** – Update user information and track reservation history
3. **Flight Operations** – Manage flight schedules, cancellations, and status tracking
4. **Capacity Management** – Monitor available seats and occupancy rates
5. **Route Analytics** – Analyze popular routes, flight frequencies, and route performance
6. **Revenue Analytics** – Calculate total revenue by airline, route profitability, and pricing insights
7. **Customer Analytics** – Identify frequent travelers, calculate customer lifetime value, and analyze booking patterns
8. **Operational Intelligence** – Track low-occupancy flights, cancellation rates, and operational efficiency

## Dataset Origin and Description

### Data Sources

The dataset consists of six collections representing different aspects of the flight management domain:

1. **`airlines`** – Reference data containing airline IATA codes, names, and country associations
2. **`airports`** – Reference data with airport identifiers, names, locations (continent, country, city), and geographic metadata
3. **`countries`** – Reference data with country codes and names
4. **`users`** – User accounts with email addresses, names, and authentication data
5. **`flights`** – Transactional data representing scheduled flights with route information, timing, capacity, pricing, and status
6. **`reservations`** – Transactional data capturing passenger reservations linked to flights and users

### Data Characteristics

- **Reference Data**: Airlines, airports, and countries are relatively stable master data
- **Transactional Data**: Flights and reservations represent high-volume operational data
- **Relationships**: The system uses reference-based relationships (via IATA codes and ObjectIds) to maintain data integrity while optimizing for query performance

For detailed information about data preprocessing, validation, and usage, see `data/README.md`.

## Key Results and Insights

### Query Categories and Insights

#### 1. Revenue Analysis (`13_total_revenue_by_airline.mongosh.js`)
- Aggregates total revenue by airline from confirmed reservations
- Enables identification of top-performing airlines
- Supports strategic pricing and capacity decisions

#### 2. Route Popularity (`14_most_popular_routes.mongosh.js`)
- Identifies the most frequently booked routes
- Helps optimize flight schedules and capacity allocation
- Supports marketing and route expansion decisions

#### 3. Customer Lifetime Value (`18_customer_lifetime_value.mongosh.js`)
- Calculates total spending per customer across all reservations
- Identifies high-value customers for loyalty programs
- Enables targeted marketing campaigns

#### 4. Low Occupancy Analysis (`17_flights_with_low_occupancy.mongosh.js`)
- Identifies flights with occupancy below threshold
- Supports dynamic pricing strategies
- Helps optimize route profitability

#### 5. Cancellation Analysis (`19_cancellation_analysis_by_route.mongosh.js`)
- Analyzes cancellation rates by route
- Identifies problematic routes requiring attention
- Supports operational improvements

#### 6. Route Performance (`15_average_flight_duration_by_route.mongosh.js`)
- Calculates average flight duration by route
- Supports scheduling and capacity planning
- Helps identify efficiency opportunities

### Performance Highlights

- **Indexed Queries**: All queries leverage appropriate indexes for optimal performance
- **Efficient Aggregations**: Complex analytics queries use optimized aggregation pipelines
- **Scalable Design**: Reference-based relationships support high-volume transactional data

For detailed performance metrics, index analysis, and explain outputs, see `performance.md`.

## Architecture and Design

The system follows MongoDB best practices for document modeling:

- **Reference-based Relationships**: Flights reference airlines and airports via IATA codes, minimizing document size and enabling efficient updates
- **Optimized Indexes**: Compound indexes support common query patterns (route lookups, date ranges, user reservations)
- **Denormalization Strategy**: Balance between embedding and referencing based on access patterns

For comprehensive architecture documentation, including schema diagrams, modeling decisions, and relationship mappings, see `architecture.md`.

## Prerequisites

- **MongoDB**: Version 7.0 or higher
- **MongoDB Shell (mongosh)**: For running scripts
- **MongoDB Compass** (optional): For visual database exploration

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure MongoDB is running and accessible at the default URI
2. **File Not Found**: Run scripts from the `project/` directory to ensure relative paths work correctly
3. **Index Errors**: Run `queries/index_blueprint.mongosh.js` if queries report missing indexes
4. **Data Import Issues**: Check that all JSON files exist in the `data/` directory

### Verification Steps

After importing data, verify the setup:

```javascript
// Connect to the database
use group_01_flight_management_system_final

// Check collection counts
db.airlines.countDocuments()
db.airports.countDocuments()
db.countries.countDocuments()
db.users.countDocuments()
db.flights.countDocuments()
db.reservations.countDocuments()

// Verify indexes
db.flights.getIndexes()
db.reservations.getIndexes()
```

## Related Documentation

- **`architecture.md`** – Detailed schema design, modeling decisions, and relationship documentation
- **`performance.md`** – Query performance analysis, index coverage, and optimization strategies
- **`data/README.md`** – Data source documentation, preprocessing steps, and validation notes
- **`../README.md`** – Group-level project overview and team information

## Project Structure

```
project/
├── README.md                    # This file
├── architecture.md              # Schema and design documentation
├── performance.md               # Performance analysis
├── import_data.mongosh.js       # Data import script
├── data/                        # JSON data files
│   ├── airlines.json
│   ├── airports.json
│   ├── countries.json
│   ├── flights.json
│   ├── reservations.json
│   ├── users.json
│   └── README.md
└── queries/                     # Query scripts
    ├── index_blueprint.mongosh.js
    ├── 01_create_flight_reservation.mongosh.js
    ├── 02_update_user_email.mongosh.js
    └── ... (20 total queries)
```

## Next Steps

1. Review `architecture.md` to understand the data model and design decisions
2. Explore `performance.md` to see query optimization strategies
3. Run individual queries to understand specific use cases
4. Experiment with modifications to see how the system responds

---

**Group 01** – MongoDB NoSQL Databases Project
For questions or issues, refer to the main project documentation in `../README.md`.
