# Architecture Document – Group 11

## 1. System Overview

This project implements the data layer of a **Travel & Booking Platform** using **MongoDB** as a NoSQL database. The architecture is designed to be **environment-agnostic**, allowing execution both on local MongoDB instances and on MongoDB Atlas.

During development, different environments were used by team members:

* Some members worked with **MongoDB local + mongosh**
* One member used **MongoDB Atlas**, due to Linux environment constraints

All scripts, queries, and architectural decisions are **fully compatible with both setups**.

The focus of this architecture is on **logical design**, not deployment infrastructure.

---

## 2. High-Level Architecture

The system follows a **script-based MongoDB architecture**, where database interactions are handled through structured JavaScript files executed via `mongosh`.

```
+-------------------------+
|   Developers / Analysts |
| (mongosh / .js scripts) |
+------------+------------+
             |
             v
+-------------------------+
|        MongoDB          |
|  (Local or Atlas)      |
|  travel_booking DB     |
+------------+------------+
             |
             v
+-------------------------+
|   Collections &        |
|   Aggregation Pipelines|
+-------------------------+
```

---

## 3. Database Architecture

### 3.1 Database

* **Name:** `travel_booking`
* **Type:** Document-oriented NoSQL database
* **Technology:** MongoDB

The database stores accommodation-related data inspired by Airbnb listings from the city of Porto.

---

### 3.2 Collections

#### 1. `porto_listings` (Primary Collection)

This is the central collection of the system.

**Purpose:**

* Store accommodation listings
* Support read-heavy access patterns typical of booking platforms

**Key fields:**

* `id`
* `name`
* `host_id`
* `host_name`
* `neighbourhood`
* `room_type`
* `price`
* `accommodates`
* `beds`
* `bedrooms`
* `review_scores_rating`
* `availability_365`

---

#### 2. `hosts` (Derived Collection)

Created using an aggregation pipeline defined in `setup_collection.mongodb.js`.

**Purpose:**

* Extract unique host information
* Reduce redundancy for host-level analysis

**Fields:**

* `id`
* `name`

---

#### 3. `neighborhood_stats` (Derived Collection)

Precomputed statistics per neighbourhood.

**Purpose:**

* Enable fast analytical queries
* Avoid repeated aggregation computations

**Fields:**

* `neighborhood`
* `total_listings`

---

## 4. Script Architecture

The project is structured around independent MongoDB scripts, each with a single responsibility.

### 4.1 `setup_collection.mongodb.js`

* Creates derived collections (`hosts`, `neighborhood_stats`)
* Demonstrates data transformation and denormalization
* Executed once after data import

---

### 4.2 `aggregation.mongodb.js`

Contains aggregation pipelines used for analytical purposes:

* Price analysis
* Revenue estimation
* Rating and room type statistics
* Neighbourhood-level insights

---

### 4.3 `business_queries.mongodb.js`

Implements business-oriented queries that simulate real user searches:

* Accommodation search by location
* Capacity and room type filtering
* Rating-based selection

---

### 4.4 `CRUD_operations.mongodb.js`

Demonstrates full data lifecycle management:

* **Create:** Insert new accommodation documents
* **Read:** Query listings using filters and projections
* **Update:** Modify existing records
* **Delete:** Remove temporary or test entries

---

## 5. Data Flow

1. Raw data is imported into the `porto_listings` collection
2. `setup_collection.mongodb.js` generates derived collections
3. Business and aggregation queries operate on primary and derived collections
4. CRUD operations validate data manipulation capabilities

This flow is identical whether MongoDB is executed locally or via Atlas.

---

## 6. Design Decisions

### 6.1 Environment Independence

The architecture was intentionally designed to be independent of the execution environment, ensuring:

* Reproducibility
* Compatibility across different systems
* No dependency on specific deployment tools

---

### 6.2 Denormalization Strategy

Derived collections are used to optimize read performance, which is critical for booking platforms.

---

### 6.3 Separation of Concerns

Each script addresses a specific aspect of the system, improving:

* Maintainability
* Readability
* Evaluation clarity

---

## 7. Scalability Considerations

Although developed for academic purposes, the architecture supports scalability through:

* MongoDB Atlas or local replica sets
* Potential sharding strategies by city or neighbourhood
* Easy extension to additional datasets

---

## 8. Conclusion

This architecture document describes a clean, modular, and environment-agnostic MongoDB solution for a **Travel & Booking Platform**. The design choices ensure clarity, flexibility, and alignment with NoSQL best practices, regardless of whether MongoDB is deployed locally or in the cloud.

---

**Group 11 – 2026**
