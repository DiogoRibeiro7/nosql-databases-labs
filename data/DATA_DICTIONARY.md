# Data Dictionary - NoSQL Databases Labs

## Overview

This document catalogs the datasets bundled with the repository. Each entry highlights the real fields you will find in the JSON/NDJSON sources, the labs that rely on the dataset, recommended indexes, and a direct link to the source file so you can inspect it before importing.

## Table of Contents

1. [Core Datasets](#core-datasets)
    - [Books](#books-dataset)
    - [Products](#products-dataset)
    - [Students](#students-dataset)
    - [Companies](#companies-dataset)
2. [Lab-Specific Datasets](#lab-specific-datasets)
    - [Orders](#orders-dataset)
    - [Customers](#customers-dataset)
    - [FoodExpress Restaurants](#foodexpress-restaurants)
    - [FoodExpress Orders](#foodexpress-orders)
3. [Supplemental City Snapshots](#supplemental-city-snapshots)
4. [External Datasets](#external-datasets)
5. [Data Types Reference](#data-types-reference)
6. [Version Information](#version-information)
7. [Usage Guidelines](#usage-guidelines)
8. [Contributing](#contributing)
9. [License](#license)

---

## Core Datasets

### Books Dataset

> Labs: Lab 01 (CRUD warm-up) and Lab 03 (projection/aggregation practice)  - Source: [datasets/books.json](datasets/books.json)

Line-delimited JSON with one document per line.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | Number | Sequential identifier (1..n) |
| `title` | String | Book title |
| `isbn` | String | 10/13-digit ISBN |
| `pageCount` | Number | 0 indicates unknown |
| `publishedDate` | Object | Stored as `{ "$date": "<ISO 8601>" }` |
| `thumbnailUrl` | String | HTTP URL to cover image (optional) |
| `shortDescription` | String | Short synopsis (optional) |
| `longDescription` | String | Full synopsis (optional) |
| `status` | String | `"PUBLISH"` or `"MEAP"` |
| `authors` | Array\<String> | One or more author names |
| `categories` | Array\<String> | Subject tags |

**Suggested indexes**

- `db.books.createIndex({ title: "text", shortDescription: "text", longDescription: "text" })` for search labs.
- `db.books.createIndex({ authors: 1 })` to filter by author.
- `db.books.createIndex({ categories: 1 })` for dashboard drill-downs.

---

### Products Dataset

> Labs: Lab 02 (modeling) and Lab 04 (aggregations)  - Source: [datasets/products.json](datasets/products.json)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | String or ObjectId | Either an ACME SKU or a BSON ObjectId |
| `name` | String | Product name |
| `brand` | String | Present on select documents |
| `type` | String or Array\<String> | Product types (e.g., `"phone"` or `["accessory","charger"]`) |
| `price` | Number | Unit price |
| `rating` | Number | Average star rating (0--"5) |
| `warranty_years` | Number | Warranty duration; decimals for partial years |
| `available` | Boolean | In-stock flag |
| `color` | String | Accessories only |
| `for` | Array\<String> | Compatible SKU list |
| `reviews` | Array\<Object> | Optional reviewer documents `{ name, stars, comment, date }` |

**Suggested indexes**

- `db.products.createIndex({ type: 1, price: 1 })` --" supports catalog filters and price sorting.
- `db.products.createIndex({ available: 1, warranty_years: 1 })` --" used in Lab 02 validation queries.
- `db.products.createIndex({ "reviews.name": 1 })` --" enables reviewer lookups when practicing multikey indexes.

---

### Students Dataset

> Labs: Lab 03 (array operators) and Lab 04 (score aggregation)  - Source: [datasets/students.json](datasets/students.json)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | Number | Sequential integer |
| `name` | String | Lowercase/mixed-case student name |
| `scores` | Array\<Object> | `{ "type": "exam" | "quiz" | "homework", "score": Number }` triples |

**Suggested indexes**

- `db.students.createIndex({ name: 1 })` --" quick lookup for targeted updates.
- `db.students.createIndex({ "scores.type": 1, "scores.score": -1 })` --" used when grading per score type.

---

### Companies Dataset

> Labs: Lab 04 (multi-stage aggregation) and Lab 05 (replication rehearsal)  - Source: [datasets/companies.json](datasets/companies.json)

Large JSON array with Crunchbase-style documents.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | BSON identifier |
| `name` | String | Company name |
| `permalink`, `crunchbase_url`, `homepage_url` | Strings | URL references |
| `category_code` | String | Industry |
| `number_of_employees` | Number | Headcount |
| `founded_year`/`month`/`day` | Number | Nullable founding info |
| `total_money_raised` | String | Human-readable totals |
| `products`, `relationships`, `competitions` | Array\<Object> | Nested relationship docs |
| `funding_rounds` | Array\<Object> | Round data (code, amount, investors) |
| `offices` | Array\<Object> | Office metadata plus lat/long |
| `milestones`, `acquisition`, `acquisitions` | Array/Object | Key lifecycle events |

**Suggested indexes**

- `db.companies.createIndex({ category_code: 1, founded_year: 1 })` for timeline dashboards.
- `db.companies.createIndex({ "offices.country_code": 1, "offices.city": 1 })` when geo-filtering.
- `db.companies.createIndex({ "funding_rounds.raised_amount": -1 })` for capital analysis.

---

## Lab-Specific Datasets

### Orders Dataset

> Labs: Lab 02 (embedding vs. referencing)  - Source: [../labs/lab02_modeling/starter/data/orders.json](../labs/lab02_modeling/starter/data/orders.json)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Unique BSON id |
| `order_id` | String | Pattern `ORD###` |
| `customer_id` | String | Matches `CUST###` from customers dataset |
| `order_date` | Object | `{ "$date": ... }` |
| `status` | String | `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| `items` | Array\<Object> | `{ product_id, product_name, quantity, unit_price, subtotal }` |
| `shipping_address` / `billing_address` | Object | `{ street, city, state, zip, country }` |
| `payment_method` | String | e.g., `credit_card` |
| `subtotal`, `tax`, `shipping_cost`, `total` | Number | Monetary fields |
| `tracking_number` | String | Nullable |
| `estimated_delivery`, `actual_delivery` | Object | Nullable ISO date wrappers |

**Suggested indexes**

- `db.orders.createIndex({ customer_id: 1, order_date: -1 })` --" used for --oerecent orders per customer.--
- `db.orders.createIndex({ status: 1, order_date: -1 })` --" supports operational dashboards.
- `db.orders.createIndex({ "items.product_id": 1 })` --" resolves line-item lookups during aggregations.

---

### Customers Dataset

> Labs: Lab 02 (data modeling)  - Source: [../labs/lab02_modeling/starter/data/customers.json](../labs/lab02_modeling/starter/data/customers.json)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | BSON id |
| `customer_id` | String | Pattern `CUST###` |
| `name` | String | Full name |
| `email` | String | Unique login email |
| `password_hash` | String | Bcrypt placeholder |
| `phone` | String | International format |
| `address` | Object | `{ street, city, state, zip, country }` |
| `loyalty_points` | Number | Running tally |
| `created_at` | Object | ISO date wrapper |

**Suggested indexes**

- `db.customers.createIndex({ customer_id: 1 })`
- `db.customers.createIndex({ email: 1 }, { unique: true })`

---

### FoodExpress Restaurants

> Labs: Instructor demos and future CRUD extensions  - Source: [food_express/foodexpress_db.restaurants.json](food_express/foodexpress_db.restaurants.json)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | BSON id |
| `name` | String | Restaurant name |
| `type` | String | Cuisine |
| `rating` | Number | Typical MongoDB rating scale (0--"5) |
| `open` | Boolean | Whether the restaurant currently accepts orders |
| `address` | Object | `{ street, city, postalCode }` |
| `menu` | Array\<Object> | `{ category, item, price }` menu entries |

**Suggested indexes**

- `db.restaurants.createIndex({ name: 1 })`
- `db.restaurants.createIndex({ "address.city": 1, open: 1 })` --" helps availability searches.

---

### FoodExpress Orders

> Labs: Instructor demos and future CRUD extensions  - Source: [food_express/foodexpress_db.orders.json](food_express/foodexpress_db.orders.json)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | BSON id |
| `orderNumber` | String | Format `ORD-####` |
| `restaurantId` | ObjectId | References a FoodExpress restaurant |
| `items` | Array\<Object> | `{ name, qty, unitPrice }` |
| `totalPrice` | Number | Calculated total |
| `status` | String | `pending`, `preparing`, `delivered`, etc. |
| `createdAt` | Object | ISO date wrapper |

**Suggested indexes**

- `db.orders.createIndex({ restaurantId: 1, createdAt: -1 })`
- `db.orders.createIndex({ status: 1, createdAt: -1 })`

---

## Supplemental City Snapshots

> Labs: Data exploration exercises and download helper validation  - Sources: [airbnb_data/sample_lisbon_listings.json](airbnb_data/sample_lisbon_listings.json), [airbnb_data/sample_porto_listings.json](airbnb_data/sample_porto_listings.json)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | Number | Listing id |
| `name` | String | Listing title |
| `neighbourhood` | String | District within the city |
| `room_type` | String | `Entire home/apt`, `Private room`, etc. |
| `accommodates`, `bedrooms`, `beds` | Number | Capacity information |
| `minimum_nights` | Number | Booking policy |
| `price` | String | Includes currency symbol (`-'45`, `-'80`) |
| `number_of_reviews` | Number | Total reviews |
| `review_scores_rating` | Number | 0--"5 style rating |
| `availability_365` | Number | Available days in a year |
| `latitude`, `longitude` | Number | Coordinates |
| `host_id` | Number | Synthetic host reference |
| `host_name` | String | Host display name |

**Suggested indexes**

- `db.listings.createIndex({ neighbourhood: 1, room_type: 1 })`
- `db.listings.createIndex({ price: 1 })` after normalizing price to numeric values inside exercises.

---

## External Datasets

### Crunchbase Database

> Labs: Advanced aggregation + replication demos  - Source: [crunchbase/crunchbase_database.json](crunchbase/crunchbase_database.json)

Schema mirrors the --oeCompanies Dataset-- core entry above but retains the original Crunchbase document layout. Use the same indexes when loading the entire dump for benchmarking.

### Enron Email Dataset

> Labs: Text processing and graph exploration  - Source: [enron/enron_messages.json](enron/enron_messages.json)

| Field | Type | Notes |
| --- | --- | --- |
| `message_id` | String | Unique identifier |
| `date` | Object | `{ "$date": ... }` |
| `from` | String | Sender |
| `to` | Array\<String> | Recipients |
| `subject` | String | Raw subject line |
| `body` | String | Plain-text message |
| `folder` | String | Source mailbox folder |

**Suggested indexes:** `{ date: -1 }`, `{ "to": 1 }`, `{ folder: 1, date: -1 }`

---

## Data Types Reference

| Type | Description | JSON Representation |
| --- | --- | --- |
| `ObjectId` | 12-byte BSON identifier | `{ "$oid": "507f1f77bcf86cd799439011" }` |
| `String` | UTF-8 string | `"Hello World"` |
| `Number` | 64-bit floating point | `42.5` |
| `Boolean` | `true` or `false` | `true` |
| `Date` | UTC datetime | `{ "$date": "2024-01-15T10:00:00Z" }` |
| `Array` | Ordered sequence | `[ "a", "b", "c" ]` |
| `Object` | Nested document | `{ "key": "value" }` |
| `Null` | Null value | `null` |

**Common patterns**

- Address objects use `{ street, city, state, zip, country }`.
- Timestamp fields follow `created_at`, `updated_at`, `deleted_at`.
- Status enums differ per dataset: Orders (`pending`-+'`delivered`), Products (`available`, `out_of_stock`, `discontinued`), Users (`active`, `inactive`, `suspended`, `deleted`).

---

## Version Information

### Versioning Scheme

- **MAJOR** --" Breaking schema change.
- **MINOR** --" Backward-compatible field additions.
- **PATCH** --" Data corrections without schema changes.

### Freshness Indicators

| Status | Description | Action |
| --- | --- | --- |
| Fresh | Updated within 30 days | None |
| Stale | No updates for 30+ days | Review before labs |
| Expired | Out of date | Refresh from upstream source |

Run `node data/data_version_tracker.js --check-freshness` to see the current status, and `--update` after modifying datasets.

---

## Usage Guidelines

1. **Validate before import.** Use `npm run test:data` or `node scripts/data-smoke-test.js`.
2. **Check compatibility.** Labs reference specific fields--"keep schema changes additive.
3. **Import with indexes in mind.** Create indexes that match the query plans listed above.
4. **Respect file size.** Some datasets exceed 50-- MB; filter subsets if needed.
5. **Document new datasets.** Update this dictionary and `data/SCHEMAS.md` with every addition.

Common import command:

```bash
mongoimport --db <database> --collection <collection> --file <path/to/file.json> --jsonArray
```

---

## Contributing

1. Update this data dictionary when adding or modifying datasets.
2. Provide validation schemas in `data/validation_schemas/` when possible.
3. Run `node data/data_version_tracker.js --update` to refresh metadata.
4. Include references to the labs that depend on the new/changed data.

---

## License

Dataset licenses vary by source. Consult each dataset folder (README, LICENSE, or metadata files) for attribution requirements before redistributing.



