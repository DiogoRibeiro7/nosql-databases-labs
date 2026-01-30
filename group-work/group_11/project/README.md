# Group 11 - MongoDB NoSQL Database Project

## Team Members

* **Délcio Cunha - 40240378**
* **Marcio Tavares - 40240379**
* **Thiago Luz - 40240380**

---

## Project Overview

This project was developed under the theme **Travel & Booking Platform**, using MongoDB as a NoSQL database to analyse and manage accommodation data inspired by Airbnb listings in the city of Porto.

The goal of the project is to demonstrate practical knowledge of:

* MongoDB data modelling
* CRUD operations
* Business-oriented queries
* Aggregation pipelines
* Collection setup and restructuring

All queries are written in MongoDB Query Language (MQL) using JavaScript.

---

## Learning Objectives Achieved

* Understanding and applying MongoDB document-based data models
* Writing efficient `find()` queries with filters, projections and sorting
* Implementing full CRUD operations
* Building aggregation pipelines for analytical queries
* Creating derived collections for optimized analysis

---

## Database Design

### Database

* **Name:** `travel_booking`

### Main Collection

* **porto_listings** – contains accommodation listings with details such as:

  * neighbourhood
  * room type
  * price
  * capacity
  * ratings
  * availability
  * host information

### Derived Collections

Using aggregation pipelines, additional collections were created:

* **hosts** – extracted host information (host_id and host_name)
* **neighborhood_stats** – precomputed statistics with total listings per neighbourhood

These collections improve data organization and analytical performance.

---

## Project Structure

```
project/
├── data/
├── queries/
│   ├── setup_collection.mongodb.js
│   ├── aggregation.mongodb.js
│   ├── business_queries.mongodb.js
│   └── CRUD_operations.mongodb.js
└── README.md
```

---

## Collection Setup

The file `setup_collection.mongodb.js` prepares the database structure by:

1. Creating a **hosts** collection by extracting host data from `porto_listings`
2. Creating a **neighborhood_stats** collection with aggregated statistics per neighbourhood

This step demonstrates data restructuring and denormalization techniques in MongoDB.

---

## Aggregation Pipelines

The file `aggregation.mongodb.js` contains advanced aggregation queries used for analytical purposes.

### Examples

* **Average price per neighbourhood**
* **Top accommodations by potential revenue**
* **Room type statistics** (count and average rating)
* **Neighbourhoods with best reviews**
* **Host and listing relationship analysis using `$lookup`**

These pipelines simulate real business analytics scenarios for a booking platform.

---

## Business Queries

The file `business_queries.mongodb.js` includes queries that reflect real user searches, such as:

* Entire homes for large groups in specific neighbourhoods
* Budget-friendly options in central areas
* Listings with high availability and low reviews
* Geolocation-based searches using latitude and longitude
* Filters by host, room type, and capacity

These queries represent realistic use cases in a travel booking system.

---

## CRUD Operations

The file `CRUD_operations.mongodb.js` demonstrates all four CRUD operations:

### Create

* Insertion of a new accommodation document with complete structure

### Read

* Verification queries using filters and projections

### Update

* Incremental updates using `$inc`
* Array updates using `$push`

### Delete

* Removal of invalid or corrupted data entries

This confirms full control over data manipulation in MongoDB.

---

## Technologies & Tools Used

* **Database:** MongoDB (Atlas)
* **Shell:** mongosh
* **Query Language:** MongoDB Query Language (MQL)
* **Scripts:** JavaScript (.mongodb.js files)
* **Optional Tools:** MongoDB Compass

---

## Conclusion

This project demonstrates the practical application of MongoDB in a **Travel & Booking** context. Through structured collections, business queries, aggregation pipelines, and CRUD operations, the group showcases a solid understanding of NoSQL database concepts and MongoDB capabilities.

---

**Group 11 – 2026**
