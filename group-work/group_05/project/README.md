# Airbnb Platform – Final Project Example (mongosh only)

This sample solution demonstrates how a final project submission can look when the entire workflow (data import, analyses, validations) is implemented with pure mongosh scripts. It makes queries for an Airbnb platform.

## Deliverables in This Folder

| Path                                 | Purpose                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `import_data.mongosh.js`             | Bootstrap script that wipes/creates the `group_05_final` database and loads inline sample data. |
| `architecture.md`                    | Written rationale for the collections, embedding strategy, and indexes.                         |
| `performance.md`                     | Notes on query patterns, index coverage, and manual explain output.                             |
| `data/`                              | JSON copies of the inline fixtures for documentation or slide decks.                            |
| `queries/0*_*.mongosh.js`            | Fifteen mongosh scripts that mix `find()` examples with richer aggregation pipelines.           |
| `queries/index_blueprint.mongosh.js` | Idempotent script that recreates indexes if you ever drop them manually.                        |
| `tests/data_quality.mongosh.js`      | Lightweight assertions to verify document counts and denormalized fields.                       |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_05/project

# 1. Seed the database with nothing but mongosh
mongosh import_data.mongosh.js

# 2. Explore the curated use cases (run any file you need)
mongosh queries/01_get_all_listings_group_by_district.mongosh.js
mongosh queries/02_group_by_neighbourhood.mongosh.js
mongosh queries/03_filter_listing_within_range_point.mongosh.js
mongosh queries/04_get_bang_for_buck.mongosh.js
mongosh queries/05_create_new_listing.mongosh.js
mongosh queries/06_avg_price_by_neighbourhood.mongosh.js
mongosh queries/07_popular_listings_by_reviews_availability.mongosh.js
mongosh queries/08_edit_reservation_dates.mongosh.js
mongosh queries/09_check_listing_availability.mongosh.js
mongosh queries/10_check_price_per_bedroom_porto.mongosh.js
mongosh queries/11_delete_most_expensive_listing_lisbon_porto.mongosh.js
mongosh queries/12_find_cheapest_private_room_lisbon.mongosh.js
mongosh queries/13_find_cheapest_team_stay_porto.mongosh.js
mongosh queries/14_hosts_response_rate_over_95_stats.mongosh.js
mongosh queries/15_two_city_budget_trip.mongosh.js

# 3. Re-apply indexes if you changed anything (optional)
mongosh queries/index_blueprint.mongosh.js

# 4. Run the sanity checks before committing
mongosh tests/data_quality.mongosh.js

# 5. Explore the advanced demos (optional)
mongosh advanced/aggregation_performance.mongosh.js
mongosh advanced/approximate_metrics.mongosh.js
```

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you point mongosh at another URI, export `MONGODB_URI` before running the commands.

## Scenario Summary

- **Airbnb Platform:** There is a new Airbnb style platform in Portugal, acting mainly in Porto and Lisbon, and we need to make queries for users.
- **Key entities:** `hosts` (reference data), `listings` (embedded venue metadata), `reservations` (observational facts enriched with customer segments), `reviews`.
- **Why mongosh only?** Reproducing grading artifacts should never require installing driver dependencies. Each script is idempotent and interacts with the DB through standard mongosh helpers such as `cat()`, `insertMany()`, and aggregation pipelines.

## Suggested Presentation Flow

1. Open the README and showcase the import/analysis commands.
2. Walk through the diagrams inside `architecture.md` (copy/paste them into slides if presenting live).
3. Run `queries/use_cases.mongosh.js` and discuss the printed summary tables.
4. Mention how `performance.md` justifies the indexes that `queries/index_blueprint.mongosh.js` applies.
5. Close with lessons learned and potential extensions (e.g., streaming dashboards, faster approximations). The `advanced/` folder has starter scripts you can reference when discussing those ideas.
