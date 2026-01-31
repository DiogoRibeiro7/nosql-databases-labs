# Group 23 – Airbnb MongoDB Project
# Group 23 – Airbnb MongoDB Project (Staybook)

## Overview

This project implements **Staybook**, a MongoDB-based accommodation booking system built using Airbnb listing datasets for Porto and Lisbon.  
The goal is to demonstrate NoSQL data modeling, querying, indexing, performance optimization, and data validation using MongoDB.

---

## Dataset

The project uses Airbnb datasets provided in the course repository:

- `data/airbnb_data/sample_porto_listings.json`
- `data/airbnb_data/sample_lisbon_listings.json`

These datasets contain accommodation listings with information such as location, price, room type, capacity, availability, and host identifiers.

Additional data (users, reservations, and reviews) is generated using seed scripts to simulate a realistic booking platform.

---

## Database

- **Database name:** `staybook`

### Collections

- `listings` – Airbnb listings imported from the datasets  
- `users` – Users of the platform (guests and hosts)  
- `reservations` – Booking records linking users and listings  
- `reviews` – Reviews associated with completed reservations  

These collections are interconnected through references (`listingId`, `guestId`, `reservationId`).

---

## Project Structure


project/
├─ architecture.md
├─ import_data.mongosh.js
├─ queries/
├─ advanced/
├─ performance.md
└─ README.md

---

## How to Run

1. Start MongoDB locally
2. Import the datasets using MongoDB Compass or:
   ```bash
   mongosh import_data.mongosh.js
3. Execute query scripts from the queries/ and advanced/ folders:
    mongosh queries/01_*.mongosh.js

