# Architecture Rationale – Food Express

This document outlines the database design and indexing strategy for the Food Express platform, ensuring a balance between data integrity and query performance.

## Data Model & Collection Strategy

The system uses a **Referential (Normalized) Model** for its core entities to avoid data duplication and ensure consistency across the platform.

### 1. `restaurants` Collection
- **Role:** Reference data for food partners.
- **Embedded Data:** The `menu` and `address` are embedded as sub-documents because they are logically part of the restaurant entity and do not grow indefinitely, preventing the "unbound array" issue.
- **Validation:** Enforces data types for `rating` (double) and `name` (string) to maintain high-quality data.

### 2. `orders` Collection
- **Role:** Observational facts (transactions).
- **Linking Strategy:** Each order contains a `restaurantId` which acts as a foreign key to the `_id` in the `restaurants` collection. 
- **Interconnection:** We use the `$lookup` aggregation stage to perform "left outer joins," allowing us to generate business reports that combine order totals with restaurant names and locations.

## Indexing Strategy (Performance Layer)

Based on the requirements in `00_create_sort_indexes.mongosh.js`, the following optimizations were implemented to ensure the engine scales linearly with data growth:

### Primary Performance Patterns
| Index Pattern | Purpose | Impact |
| ------------- | ------- | ------ |
| `{ orderNumber: 1 }` (Unique) | Business Integrity | Prevents duplicate orders and allows $O(1)$ lookups by ID. |
| `{ totalPrice: 1, createdAt: -1 }` | Compound Filtering | Supports "High-value recent orders" queries without memory sorting (IXSCAN). |
| `{ restaurantId: 1 }` | Join Optimization | Drastically speeds up `$lookup` operations when joining orders to restaurants. |
| `{ "address.city": 1, rating: -1 }` | Multi-key Search | Allows fast filtering by city while keeping restaurants ranked by quality. |

## Query Optimization (Explain Analysis)

By using `.explain("executionStats")` on our aggregation pipelines, we confirmed that:
1. **No COLLSCANs:** Queries for specific cities or price ranges use index scans (IXSCAN).
2. **Covered Queries:** Whenever possible, the engine retrieves data directly from the index keys, minimizing disk I/O.
3. **Memory Efficiency:** Aggregations that require sorting (like revenue rankings) are handled by the index, staying within the 100MB RAM limit for pipeline stages.

## Scalability Path
To support future growth, the `orders` collection is prepared for **Sharding** on the `restaurantId` or `createdAt` fields, allowing the database to distribute the transaction load across multiple servers.