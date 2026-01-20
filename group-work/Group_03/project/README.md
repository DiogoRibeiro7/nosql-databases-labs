# Lisbon Airbnb Listings – NoSQL Database Project (mongosh only)

This project demonstrates a complete NoSQL database workflow implemented exclusively with mongosh scripts.
It analyzes Airbnb listings, hosts, and bookings in Lisbon, focusing on pricing strategy, availability, guest demand, and revenue performance.

All database operations — data import, indexing, and analytics — are performed using pure mongosh, ensuring the project is easy to reproduce in any standard MongoDB environment without additional dependencies.

## Deliverables in This Folder

| Path                                 | Purpose                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `import_data.mongosh.js`             | Bootstrap script that wipes/creates the `group_03_airbnb` database and loads inline sample data. |
| `architecture.md`                    | Written rationale for the collections, embedding strategy, and indexes.                          |
| `data/`                              | JSON copies of the inline fixtures for documentation or slide decks.                             |
| `queries/index_blueprint.mongosh.js` | Idempotent script that recreates indexes if you ever drop them manually.                         |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_03/project

# 1. Seed the database with nothing but mongosh
mongosh import_data.mongosh.js

# 2. Explore the curated use cases (run any file you need)
mongosh queries/01_top_listings_by_reviews.mongosh.js
mongosh queries/02_top_listings_by_rating.mongosh.js
mongosh queries/03_average_price_per_neighbourhood.mongosh.js
mongosh queries/04_cheapest_listings_by_room_type.mongosh.js
mongosh queries/05_top_listings_by_availability.mongosh.js
mongosh queries/06_listings_count_per_host.mongosh.js
mongosh queries/07_average_price_by_room_type.mongosh.js
mongosh queries/08_high_value_listings.mongosh.js
mongosh queries/09_top_listings_by_total_renvenue.mongosh.js
mongosh queries/10a_revenue_by_neighbourhood_simple.mongosh.js
mongosh queries/10b_revenue_by_neighbourhood_lookup.mongosh.js
mongosh queries/11_monthly_booking_trends.mongosh.js
mongosh queries/12_total_revenue_per_host.mongosh.js
mongosh queries/13_booking_status_distribution.mongosh.js
mongosh queries/14_average_stay_length.mongosh.js
mongosh queries/15_most_booked_listings.mongosh.js
mongosh queries/16_revenue_by_room_type.mongosh.js
mongosh queries/17_hosts_with_most_listings.mongosh.js
mongosh queries/18_neighbourhood_performance_dashboard.mongosh.js
mongosh queries/19_average_price_per_host.mongosh.js
mongosh queries/20_host_revenue_inventory_efficiency.mongosh.js
mongosh queries/21_revenue_over_time.mongosh.js
mongosh queries/22_admin_tools.mongosh.js
mongosh queries/23_analytics_neighbourhood_revenue.mongosh.js
mongosh queries/24_crud_create.mongosh.js
mongosh queries/25_crud_delete.mongosh.js
mongosh queries/26_crud_update.mongosh.js
mongosh queries/27_filter_by_neighbourhood.mongosh.js
mongosh queries/28_filter_by_price_roomtype.mongosh.js
mongosh queries/29_performance_check.mongosh.js

# 3. Re-apply indexes if you changed anything (optional)
mongosh queries/index_blueprint.mongosh.js

```

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you point mongosh at another URI, export `MONGODB_URI` before running the commands.

## Scenario Summary

- **Business driver:**  
  Lisbon’s tourism and housing analysts require data-driven insight into the short-term rental market to better understand pricing behavior, demand concentration, and host performance across the city.

- **Key entities:**
  - `listings` – Airbnb property details, including location, room type, pricing, availability, and reviews
  - `hosts` – Host-level information such as portfolio size and pricing strategy
  - `bookings` – Transactional booking data capturing guest activity, dates, status, and revenue

- **Analytical goals:**
  - Identify high-demand neighbourhoods and pricing hotspots
  - Compare pricing and availability across room types
  - Measure host revenue, inventory size, and efficiency
  - Track booking volume and revenue trends over time

- **Why mongosh only?**  
  All data import, indexing, and analysis tasks are implemented exclusively using `mongosh` to ensure the project is fully reproducible, easy to audit, and independent of external programming languages or MongoDB drivers. Each script is idempotent and relies on standard MongoDB shell operations and aggregation pipelines.

**Data Model Highlights**

## Key Query Patterns Demonstrated

| Pattern                         | Description                                                                        | Queries                                |
| ------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------- |
| Simple Aggregation              | Grouping and sorting over a single collection to compute totals or averages        | 01, 02, 03, 05, 06, 07, 13, 14, 17, 19 |
| Filtered Read (Selective Find)  | Targeted document retrieval using conditional filters                              | 08, 27, 28                             |
| Ranking / Top-N Analysis        | Sorting and limiting results to identify top-performing entities                   | 01, 02, 05, 09, 12, 15, 17             |
| Join via `$lookup`              | Combining data across collections using references                                 | 10A, 10B, 15, 16, 20, 23               |
| Time-Series Aggregation         | Grouping by time periods to identify trends                                        | 11, 21                                 |
| Multi-Metric Dashboard          | Aggregating multiple KPIs into a single grouped output                             | 18, 20                                 |
| Host-Level Performance Analysis | Measuring inventory size, pricing, and revenue per host                            | 06, 12, 17, 19, 20                     |
| Revenue Analytics               | Revenue computation from booking-level transactional data                          | 09, 10A, 10B, 12, 16, 20, 21, 23       |
| CRUD Operations                 | Examples of create/update/delete patterns used in tests and demos                  | 24, 25, 26                             |
| Admin & Health Checks           | DB stats, collection counts and quick health queries                               | 22                                     |
| Performance & Explain Plans     | Scripts that inspect indexes, stats and run `explain()` for representative queries | 29                                     |

**Index Performance Comparison**

The project also includes two versions of a related aggregation to demonstrate index impact and benchmarking:

- `queries/10a_revenue_by_neighbourhood_simple.mongosh.js` (Query 10A — baseline / no index): run this aggregation with relevant indexes removed or force a collection scan (for example using a hint like `{ $natural: 1 }`) to establish a performance baseline that highlights collection-scan costs.
- `queries/10b_revenue_by_neighbourhood_lookup.mongosh.js` (Query 10B — with indexes): the same revenue-by-neighbourhood analysis implemented in a booking-driven way; when indexes such as `bookings.listing_id` and `listings.location.neighbourhood` are present the aggregation can leverage them for much faster lookup and grouping.

**Technologies Used**

- Database: MongoDB 7.0+
- Shell: MongoDB Shell (mongosh)
- Query Language: MongoDB Query Language (MQL)
- Data Source: Porto Airbnb Listings (JSON)
- Visualization: MongoDB Compass (optional)

**Queries Summary**

| Num | Query file                                                  | Type                   | Description                                                                  |
| --- | ----------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| 01  | `queries/01_top_listings_by_reviews.mongosh.js`             | Aggregation            | Top 10 listings by number of reviews (popularity ranking).                   |
| 02  | `queries/02_top_listings_by_rating.mongosh.js`              | Aggregation            | Top-rated listings (rating then review count).                               |
| 03  | `queries/03_average_price_per_neighbourhood.mongosh.js`     | Aggregation            | Average daily price per neighbourhood.                                       |
| 04  | `queries/04_cheapest_listings_by_room_type.mongosh.js`      | Aggregation            | Cheapest listing per room type (top result per group).                       |
| 05  | `queries/05_top_listings_by_availability.mongosh.js`        | Aggregation            | Listings ranked by days available in the year.                               |
| 06  | `queries/06_listings_count_per_host.mongosh.js`             | Aggregation            | Number of listings per host (host concentration).                            |
| 07  | `queries/07_average_price_by_room_type.mongosh.js`          | Aggregation            | Average price grouped by room type.                                          |
| 08  | `queries/08_high_value_listings.mongosh.js`                 | Find / Filter          | Premium listings filtered by price and rating.                               |
| 09  | `queries/09_top_listings_by_total_renvenue.mongosh.js`      | Aggregation (bookings) | Top listings by total revenue computed from bookings.                        |
| 10a | `queries/10a_revenue_by_neighbourhood_simple.mongosh.js`    | Aggregation + $lookup  | Revenue by neighbourhood (listings-driven lookup to bookings).               |
| 10b | `queries/10b_revenue_by_neighbourhood_lookup.mongosh.js`    | Aggregation + $lookup  | Revenue by neighbourhood (booking-driven lookup to listings).                |
| 11  | `queries/11_monthly_booking_trends.mongosh.js`              | Aggregation            | Monthly booking counts (seasonality) using booking_date.                     |
| 12  | `queries/12_total_revenue_per_host.mongosh.js`              | Aggregation (bookings) | Total revenue aggregated per host.                                           |
| 13  | `queries/13_booking_status_distribution.mongosh.js`         | Aggregation            | Distribution of booking statuses (confirmed/cancelled/etc.).                 |
| 14  | `queries/14_average_stay_length.mongosh.js`                 | Aggregation            | Average stay length in nights across bookings.                               |
| 15  | `queries/15_most_booked_listings.mongosh.js`                | Aggregation + $lookup  | Most booked listings with joined listing metadata.                           |
| 16  | `queries/16_revenue_by_room_type.mongosh.js`                | Aggregation + $lookup  | Revenue aggregated by room type.                                             |
| 17  | `queries/17_hosts_with_most_listings.mongosh.js`            | Aggregation            | Hosts ranked by number of listings.                                          |
| 18  | `queries/18_neighbourhood_performance_dashboard.mongosh.js` | Aggregation            | Multi-metric neighbourhood dashboard (price, rating, availability, reviews). |
| 19  | `queries/19_average_price_per_host.mongosh.js`              | Aggregation            | Average listing price computed per host.                                     |
| 20  | `queries/20_host_revenue_inventory_efficiency.mongosh.js`   | Aggregation + $lookup  | Host-level revenue vs inventory efficiency and averages.                     |
| 21  | `queries/21_revenue_over_time.mongosh.js`                   | Aggregation            | Monthly revenue time series (year-month buckets).                            |
| 22  | `queries/22_admin_tools.mongosh.js`                         | Admin / Utility        | Quick DB stats, collection counts and top hosts by listings.                 |
| 23  | `queries/23_analytics_neighbourhood_revenue.mongosh.js`     | Aggregation + $lookup  | Top neighbourhoods by confirmed booking revenue (bookings-driven).           |
| 24  | `queries/24_crud_create.mongosh.js`                         | CRUD Example           | Demo: insert a listing and a corresponding booking.                          |
| 25  | `queries/25_crud_delete.mongosh.js`                         | CRUD Example           | Demo: delete listings for a test host and cascade-delete bookings.           |
| 26  | `queries/26_crud_update.mongosh.js`                         | CRUD Example           | Demo: update listing price and availability for a test host.                 |
| 27  | `queries/27_filter_by_neighbourhood.mongosh.js`             | Find / Filter          | Filter listings by neighbourhood for localized search.                       |
| 28  | `queries/28_filter_by_price_roomtype.mongosh.js`            | Find / Filter          | Filter listings by price range and room type.                                |
| 29  | `queries/29_performance_check.mongosh.js`                   | Performance / Utility  | Collection stats, indexes list, and `explain()` for a representative query.  |

**Contributors**

Please replace the placeholder rows below with actual student details and contribution percentages.

| Name            | Student ID | Email                 | Contribution % |
| --------------- | ---------- | --------------------- | -------------- |
| Miguel Machado  | 40230260   | 40230260@esmad.ipp.pt | 33.3%          |
| Manuel Teixeira | 40240217   | 40240217@esmad.ipp.pt | 33.3%          |
| Linda Silva     | 40240005   | 40240005@esmad.ipp.pt | 33.3%          |

**Total**: 100%

**Teacher**

Professor Diogo Filipe de Bastos Sousa Ribeiro

**Data Model Summary**

For details on the data model and rationale see `architecture.md`. For index creation re-run `mongosh queries/index_blueprint.mongosh.js`.

Happy exploring — run the import and try the queries in `queries/` to reproduce the analysis.
