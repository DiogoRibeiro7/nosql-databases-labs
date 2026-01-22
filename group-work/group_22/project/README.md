# Food Express — Group 22 (Final Project)

This project contains the dataset, import utilities, queries, and lightweight tests for the Food Express delivery dataset used by Group 22.

## Deliverables in This Folder

|      Path                       |                                                        Purpose                                                       |
|      ----                       |                                                        -------                                                       |
| `data/seed.js`                  | Node seed script that loads `restaurants` and `orders`, then builds `menu_items` and `order_items`.                  |
| `data/`                         | JSON source fixtures used by the seed script (`foodexpress_db.restaurants.json`, `foodexpress_db.orders.json`,etc.). |
| `src/db.js`                     | Helper to connect to MongoDB using values from `.env`.                                                               |
| `queries/`                      | Collection of mongosh query examples and analysis scripts.                                                           |
| `tests/data_quality.mongosh.js` | Lightweight mongosh checks for presence and referential integrity.                                                   |
| `package.json`                  | Contains convenient npm scripts (e.g., `npm run seed`).                                                              |

## Quickstart (Local MongoDB) ⚡

1. Copy and configure environment variables:

```bash
cd group-work/group_22/project
# Unix / macOS:
cp .env.template .env
# Windows (PowerShell / CMD):
copy .env.template .env
# Edit `.env` if you need a non-default MONGODB_URI or DB name
```

Contents of `.env.template` (defaults):

```env
# Copy this file to `.env` and edit as needed
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=group_22
# STRICT_MODE (optional): `true` to enforce exact seed counts in tests
STRICT_MODE=true
```

2. Install dependencies:

```bash
npm install
```

3. Seed the database:

```bash
npm run seed
```

The seed script will:
- Insert `restaurants` and `orders` from `data/` JSON files.
- Generate `menu_items` from each restaurant's `menu` array.
- Generate `order_items` from each order's `items` array.

4. Run the provided queries with mongosh (examples):

```bash
mongosh queries/01_open_restaurants_in_city.mongosh.js
mongosh queries/11_revenue_for_restaurant.mongosh.js
mongosh queries/16_most_popular_cuisine_per_city.mongosh.js
```

5. Run the data quality checks:

```bash
npm test
```

This test ensures collections exist, derived collections were generated, and that documents reference existing `restaurants` / `orders` as appropriate. It also enforces the exact seed counts from the fixtures by default:

- `restaurants`: 50
- `orders`: 50
- `menu_items`: 100
- `order_items`: 100

> Note: The repository assumes a MongoDB instance reachable via `MONGODB_URI` in `.env` (default `mongodb://localhost:27017`). Ensure the DB is running before seeding.



## Scenario Summary

- **Business driver:** Analyze restaurant performance and order patterns to identify high-performing dishes, peak ordering times, and opportunities for menu optimisation.
- **Key entities:** `restaurants`, `orders`, `menu_items`, `order_items`.

## Suggested Presentation Flow ✅

1. Explain the dataset and seeding process (`npm run seed`).
2. Run a few queries from `queries/` to demonstrate typical analyses and explain results.
3. Run `mongosh tests/data_quality.mongosh.js` to show the automated sanity checks.
4. Discuss indexing and performance trade-offs if you make changes (see `src/db.js` for DB configuration).

## Troubleshooting & Tips ⚠️

- If `npm run seed` fails, verify `.env` values and that MongoDB is reachable.
- Use `npm run seed` again if you change fixtures; the script is idempotent for base collections.
- To explore quickly, run `npm run open-restaurants` (available as an npm script) to open a sample query with mongosh.

---

If you'd like, I can also:
- Add a `npm test` script that runs the `mongosh tests/data_quality.mongosh.js` command, or
- Enforce strict seed counts in the test file (verify exact document counts from `data/`).

Choose one and I'll implement it for you. 
