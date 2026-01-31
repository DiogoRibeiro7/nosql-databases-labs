# Group 01 - Flight Management System

## Team Members

See our team composition in [group_members.md](../group_members.md#group-01)

## Project Overview

This project implements a comprehensive **Flight Management System** using MongoDB, demonstrating advanced NoSQL database design patterns, query optimization, and analytical capabilities for real-world airline operations. The system tracks airline operations, flight schedules, and passenger reservations while providing business intelligence through complex aggregation pipelines.

### Key Features

- **Operational Management**: Track flight schedules, capacity, and status updates
- **Customer Service**: Manage reservations, user accounts, and customer inquiries
- **Business Analytics**: Analyze revenue, route popularity, customer lifetime value, and operational efficiency
- **Strategic Planning**: Identify underperforming routes, optimize pricing, and understand customer behavior patterns

## Project Structure

```
group_01/
├── README.md                    # This file (group-level overview)
├── project/                     # Main project deliverables
│   ├── README.md                # Detailed project documentation
│   ├── architecture.md          # Schema design and modeling decisions
│   ├── performance.md           # Query performance analysis
│   ├── import_data.mongosh.js   # Database bootstrap script
│   ├── data/                    # JSON data files
│   │   ├── airlines.json
│   │   ├── airports.json
│   │   ├── countries.json
│   │   ├── flights.json
│   │   ├── reservations.json
│   │   ├── users.json
│   │   └── README.md
│   └── queries/                 # 20+ query scripts
│       ├── index_blueprint.mongosh.js
│       ├── 01_create_flight_reservation.mongosh.js
│       ├── 02_update_user_email.mongosh.js
│       └── ... (20 total queries)
├── solution.md                  # Solution documentation
└── solution_example.md          # Example solutions
```

## Quick Start

Navigate to the project directory and follow these steps:

```bash
cd project

# 1. Import data into MongoDB
mongosh import_data.mongosh.js

# 2. Create indexes for optimal performance
mongosh queries/index_blueprint.mongosh.js

# 3. Run individual queries
mongosh queries/01_create_flight_reservation.mongosh.js
mongosh queries/13_total_revenue_by_airline.mongosh.js
```

For detailed setup instructions and troubleshooting, see [`project/README.md`](project/README.md).

## Database Schema

The system consists of six collections:

| Collection | Type | Purpose |
|------------|------|---------|
| `airlines` | Reference | Airline IATA codes, names, and country associations |
| `airports` | Reference | Airport identifiers, names, and geographic metadata |
| `countries` | Reference | Country codes and names |
| `users` | Reference | User accounts with email addresses and authentication data |
| `flights` | Transactional | Scheduled flights with route, timing, capacity, pricing, and status |
| `reservations` | Transactional | Passenger reservations linked to flights and users |

### Design Highlights

- **Reference-based relationships**: Flights reference airlines and airports via IATA codes for efficient updates
- **Optimized indexes**: Compound indexes support common query patterns (route lookups, date ranges, user reservations)
- **Balanced denormalization**: Strategic embedding vs referencing based on access patterns

For comprehensive architecture documentation, see [`project/architecture.md`](project/architecture.md).

## Query Capabilities

The system provides 20+ comprehensive queries covering:

### Operational Queries
- Create and manage flight reservations
- Update user information
- Cancel flights and manage flight status
- Check available seats and capacity

### Analytical Queries
- **Revenue Analysis**: Total revenue by airline, route profitability
- **Route Analytics**: Most popular routes, average flight duration by route
- **Customer Analytics**: Customer lifetime value, users with most reservations
- **Operational Intelligence**: Low-occupancy flights, cancellation analysis by route

### Example Query: Total Revenue by Airline

```javascript
db.reservations.aggregate([
  { $match: { status: "confirmed" } },
  {
    $lookup: {
      from: "flights",
      localField: "flightNumber",
      foreignField: "flightNumber",
      as: "flight"
    }
  },
  { $unwind: "$flight" },
  {
    $group: {
      _id: "$flight.airlineIata",
      totalRevenue: { $sum: "$flight.price" }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);
```

For all query examples and detailed documentation, see [`project/README.md`](project/README.md#query-examples-from-our-solution).

## Technologies & Tools

- **Database**: MongoDB 7.0+
- **Shell**: MongoDB Shell (mongosh)
- **Query Language**: MongoDB Query Language (MQL)
- **Tools**: MongoDB Compass (optional, for GUI access)
- **Scripts**: JavaScript (mongosh) for all database operations

## Performance Optimizations

- **Indexed Queries**: All queries leverage appropriate indexes for optimal performance
- **Efficient Aggregations**: Complex analytics queries use optimized aggregation pipelines
- **Scalable Design**: Reference-based relationships support high-volume transactional data
- **Query Optimization**: Covered queries, proper index strategies, and minimal collection scans

For detailed performance metrics and index analysis, see [`project/performance.md`](project/performance.md).

## Learning Outcomes

Through this project, we gained practical experience in:

- **NoSQL Database Design**: Document modeling patterns, embedding vs referencing strategies
- **MongoDB Query Language**: Complex filtering, aggregation pipelines, and update operations
- **Performance Optimization**: Index design, query optimization, and explain() analysis
- **Business Intelligence**: Building analytical queries for real-world business scenarios
- **Data Modeling Best Practices**: Schema design for operational and analytical workloads

## Documentation

- **[`project/README.md`](project/README.md)** – Complete project documentation with setup instructions
- **[`project/architecture.md`](project/architecture.md)** – Detailed schema design and modeling decisions
- **[`project/performance.md`](project/performance.md)** – Query performance analysis and optimization strategies
- **[`project/data/README.md`](project/data/README.md)** – Data source documentation and validation notes
- **[`solution.md`](solution.md)** – Solution documentation

## Next Steps

1. Review [`project/architecture.md`](project/architecture.md) to understand the data model
2. Explore [`project/performance.md`](project/performance.md) to see optimization strategies
3. Run individual queries to understand specific use cases
4. Experiment with modifications to see how the system responds

---

**Group 01** – MongoDB NoSQL Databases Project | 2026
