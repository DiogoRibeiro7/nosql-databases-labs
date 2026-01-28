# Sakila DB – Final Project (mongosh only)

This sample solution demonstrates how a final project submission can look when the entire workflow (data import, analyses, validations) is implemented with pure mongosh scripts.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `import.bat` | Batch file that creates the `sakila` database. |
| `architecture.md` | Written rationale for the collections, embedding strategy, and indexes. |
| `data/` | JSON copies of the inline fixtures for documentation or slide decks. |
| `queries/0*_*.mongosh.js` | Thirteen mongosh scripts that mix `find()` examples with richer aggregation pipelines. |
| `queries/index_blueprint.mongosh.js` | Idempotent script that recreates indexes if you ever drop them manually. |

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you point mongosh at another URI, export `MONGODB_URI` before running the commands.

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_09/project

# 1. Seed the database with nothing but mongosh
mongosh import_data.mongosh.js

# 2. Explore the curated use cases (run any file you need)
mongosh queries/01_film_infos.mongosh.js
mongosh queries/02_get_active_customers_by_name.mongosh.js
mongosh queries/03_all_customer_rentals.mongosh.js
mongosh queries/04_get_actors_by_film_count.mongosh.js
mongosh queries/05_get_adresses_by_city.mongosh.js
mongosh queries/06_get_cities_by_country.mongosh.js
mongosh queries/07_highest_paying_customers.mongosh.js
mongosh queries/08_staff_performance.mongosh.js
mongosh queries/09_most_rented_categories.mongosh.js
mongosh queries/10_get_shop_loc_and_num_film.mongosh.js
mongosh queries/11_get films_in_shop.mongosh.js
mongosh queries/12_get_Horror_movies.mongosh.js
mongosh queries/13_most_popular_actors_by_rentals.mongosh.js
mongosh queries/14_revenue_per_store.mongosh.js
mongosh queries/15_average_rental_time.mongosh.js
mongosh queries/16_get_movies_the.mongosh.js
mongosh queries/17_film_stats.mongosh.js
mongosh queries/18_most_rended_categories_with_explain.mongosh.js
mongosh queries/19_customer_stats.mongosh.js
mongosh queries/20_film_infos_with_explain.mongosh.js

# 3. Re-apply indexes if you changed anything (optional)
mongosh queries/index_blueprint.mongosh.js
```
The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you point mongosh at another URI, export `MONGODB_URI` before running the commands.

## Scenario Summary

- **Business driver:** In a world of streaming services, where movies can instantly become inaccessible from one moment to the other, physical media is becoming more and more sought after by people.
- **Key entities:** `film`, `customer`, `staff` and `address` (reference data), `film_category`, `film_actor`, `store` and `inventory` (embedded venue metadata), `category`, `city`, `country`, `language`, `payment` and `rental` (observational facts enriched with customer segments).
- **Why mongosh only?** Reproducing grading artifacts should never require installing driver dependencies. Each script is idempotent and interacts with the DB through standard mongosh helpers such as `cat()`, `insertMany()`, and aggregation pipelines.

## Teamwork

This project was split very evenly between the two. We began by having one of us do the "customer" side, and the other the "film" side of the database, but eventually started working together to create queries that used both.
Beyond that, there wasn't much planning. We simply started on one section of the project and told the other what was being done, who would either already be or would start working on another part (ex. one did `architecture.md` while another did `README.md`).